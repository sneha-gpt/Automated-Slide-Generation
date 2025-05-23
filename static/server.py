from flask import Flask, request, jsonify  # Flask for web server and handling requests
from flask_cors import CORS  # CORS for handling cross-origin requests
import fitz  # PyMuPDF for PDF processing
import pytesseract  # Tesseract OCR for scanned PDFs
from PIL import Image  # PIL for image processing
import os  # For file and directory operations
import time  # For handling timeouts
import logging  # For logging errors and information
import shutil  # For safe file operations
from werkzeug.utils import secure_filename  # For securing uploaded file names

# Initialize Flask app
app = Flask(__name__)

# Configure logging
logging.basicConfig(level=logging.DEBUG)  # Set logging level to DEBUG for more detail
logger = logging.getLogger(__name__)  # Create a logger instance

# Very permissive CORS for development
CORS(app)

# Add manual CORS headers to all responses
@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    return response

# Add a simple test endpoint
@app.route('/test', methods=['GET'])
def test():
    return jsonify({'status': 'OK', 'message': 'Server is running'})

logger.info("Flask server configured with permissive CORS")

# Configure upload folder and allowed file extensions
UPLOAD_FOLDER = 'uploads'  # Directory to store uploaded files
ALLOWED_EXTENSIONS = {'pdf', 'txt'}  # Allowed file types
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB maximum file size
PDF_PROCESSING_TIMEOUT = 30  # 30 seconds timeout for PDF processing

# Create the upload folder if it doesn't exist
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Set the upload folder in Flask app configuration
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE  # Set maximum content length in Flask

def allowed_file(filename):
    """
    Check if the uploaded file has an allowed extension.
    :param filename: Name of the uploaded file
    :return: True if the file is allowed, False otherwise
    """
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def safe_remove_file(file_path):
    """
    Safely remove a file with error handling to prevent crashes.
    :param file_path: Path to the file that needs to be removed
    :return: True if successful, False otherwise
    """
    try:
        # Check if the file exists before attempting to remove it
        if os.path.exists(file_path):
            os.remove(file_path)
            logger.info(f"File {file_path} removed successfully")
            return True
        else:
            logger.warning(f"File {file_path} does not exist, nothing to remove")
            return True  # Not an error, just nothing to do
    except PermissionError as e:
        logger.error(f"Permission error removing file {file_path}: {str(e)}")
        # Try to change permissions and retry
        try:
            os.chmod(file_path, 0o666)  # Make file writable
            os.remove(file_path)
            logger.info(f"File {file_path} removed after changing permissions")
            return True
        except Exception as inner_e:
            logger.error(f"Still cannot remove file {file_path} after changing permissions: {str(inner_e)}")
            return False
    except (IOError, OSError) as e:
        logger.error(f"OS error removing file {file_path}: {str(e)}")
        return False
    except Exception as e:
        logger.error(f"Unexpected error removing file {file_path}: {str(e)}")
        return False

def extract_text_from_pdf(file_path):
    """
    Extract text from PDF files, handling both searchable and scanned PDFs.
    Added handling for corrupt PDFs, empty files, and timeouts for large files.
    :param file_path: Path to the PDF file
    :return: Extracted text and error message (if any)
    """
    # Check if file exists
    if not os.path.exists(file_path):
        return None, f"File {file_path} does not exist"

    # Check if file is empty
    if os.path.getsize(file_path) == 0:
        return None, "File is empty"

    try:
        # Try to open the PDF file with error handling for corrupt files
        try:
            doc = fitz.open(file_path)
        except fitz.FileDataError:
            return None, "The PDF file appears to be corrupt"
        except Exception as e:
            return None, f"Could not open PDF file: {str(e)}"

        # Check if document has pages
        if doc.page_count == 0:
            doc.close()
            return None, "The PDF file contains no pages"

        text = ""  # Initialize text storage
        is_scanned = True  # Flag to check if the PDF is scanned

        # Attempt to extract text from each page with page-level error handling
        for page_num in range(doc.page_count):
            try:
                page = doc.load_page(page_num)  # Load the page
                page_text = page.get_text()  # Extract text from the page
                if page_text.strip():  # Check if text is found
                    is_scanned = False  # Mark as not scanned
                    text += page_text + "\n"  # Append text to the result
            except Exception as e:
                logger.warning(f"Error extracting text from page {page_num} in {file_path}: {str(e)}")
                # Continue to the next page instead of failing

        # If no text was found, assume it's a scanned PDF and use OCR
        if is_scanned:
            logger.info(f"Detected scanned PDF: {file_path}")
            # Process a limited number of pages if the document is large
            max_pages = min(doc.page_count, 20)  # Limit to first 20 pages for large documents
            
            for page_num in range(max_pages):
                try:
                    page = doc.load_page(page_num)  # Load the page
                    pix = page.get_pixmap()  # Render the page as an image
                    
                    # Skip pages that are too large to process
                    if pix.width * pix.height > 4000 * 4000:  # Arbitrary limit for very large images
                        logger.warning(f"Page {page_num} is too large to process with OCR, skipping")
                        continue
                    
                    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)  # Convert to PIL image
                    page_text = pytesseract.image_to_string(img)  # Perform OCR on the image
                    text += page_text + "\n"  # Append the extracted text
                except Exception as e:
                    logger.warning(f"Error performing OCR on page {page_num} in {file_path}: {str(e)}")
                    # Continue to the next page instead of failing

        doc.close()  # Close the PDF document
        
        # Check if any text was extracted
        if not text.strip():
            return None, "No text could be extracted from the PDF file"
            
        return text.strip(), None  # Return extracted text and no error

    except Exception as e:
        logger.error(f"Error processing PDF {file_path}: {str(e)}")  # Log the error
        return None, str(e)  # Return no text and the error message

def extract_text_from_txt(file_path):
    """
    Extract text from TXT files.
    :param file_path: Path to the TXT file
    :return: Extracted text and error message (if any)
    """
    # Check if file exists
    if not os.path.exists(file_path):
        return None, f"File {file_path} does not exist"

    # Check if file is empty
    if os.path.getsize(file_path) == 0:
        return None, "File is empty"
        
    try:
        # Limit file size for reading to prevent memory issues
        file_size = os.path.getsize(file_path)
        max_size = 10 * 1024 * 1024  # 10MB limit for text files
        
        if file_size > max_size:
            logger.warning(f"File {file_path} exceeds recommended size limit for text files")
            # For large files, read only the first 10MB
            with open(file_path, 'r', encoding='utf-8', errors='replace') as file:
                text = file.read(max_size)
                return text.strip() + "\n[Note: File was truncated due to large size]", None
        
        with open(file_path, 'r', encoding='utf-8') as file:
            return file.read().strip(), None  # Read and return text with no error
    except UnicodeDecodeError:
        # Try different encodings if UTF-8 fails
        try:
            with open(file_path, 'r', encoding='latin-1') as file:
                return file.read().strip(), None  # Read and return text with no error
        except Exception as e:
            return None, f"Error reading file with alternative encoding: {str(e)}"  # Return error message
    except Exception as e:
        logger.error(f"Error processing TXT {file_path}: {str(e)}")  # Log the error
        return None, str(e)  # Return no text and the error message

@app.route('/process', methods=['POST', 'OPTIONS'])
def process_document():
    """
    Endpoint to process uploaded documents (PDF or TXT).
    :return: JSON response with extracted text or error message
    """
    # Handle OPTIONS request for CORS preflight
    if request.method == 'OPTIONS':
        response = app.make_default_options_response()
        return response

    if 'file' not in request.files:
        logger.error("No file part in the request")
        return jsonify({'error': 'No file part in the request'}), 400  # Return error if no file is uploaded
    
    file = request.files['file']
    if file.filename == '':
        logger.error("No file selected for upload")
        return jsonify({'error': 'No file selected for upload'}), 400  # Return error if no file is selected

    if not allowed_file(file.filename):
        logger.error(f"File type not allowed: {file.filename}")
        return jsonify({'error': f"File type not allowed: {file.filename}. Supported formats are PDF and TXT."}), 400

    # Check the file size before processing
    file.seek(0, os.SEEK_END)
    file_size = file.tell()
    file.seek(0)  # Reset file pointer to beginning
    
    if file_size > MAX_FILE_SIZE:
        logger.error(f"File size {file_size} exceeds maximum allowed size of {MAX_FILE_SIZE} bytes")
        return jsonify({
            'error': f"File size exceeds the maximum allowed size of {MAX_FILE_SIZE / (1024 * 1024):.1f}MB"
        }), 413  # 413 Payload Too Large

    try:
        filename = secure_filename(file.filename)  # Secure the file name
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)  # Create file path
        logger.info(f"Saving file to {file_path}")
        file.save(file_path)  # Save the uploaded file

        file_extension = filename.rsplit('.', 1)[1].lower()  # Get file extension
        
        # Process the file based on its extension
        try:
            if file_extension == 'pdf':
                text, error = extract_text_from_pdf(file_path)
            else:  # txt file
                text, error = extract_text_from_txt(file_path)
        except Exception as e:
            error = str(e)
            text = None

        # Clean up the uploaded file with safe removal
        if not safe_remove_file(file_path):
            logger.warning(f"Could not remove temporary file {file_path}")
            # Schedule cleanup for later with OS task scheduler if needed

        if error:
            logger.error(f"Error during file processing: {error}")
            return jsonify({'error': f"Error processing file {filename}: {error}"}), 500

        if not text:
            logger.warning(f"No text extracted from {filename}")
            return jsonify({'error': f"No text could be extracted from the document {filename}."}), 400

        # Return success response with extracted text
        logger.info(f"Successfully processed file: {filename}")
        return jsonify({
            'success': True,
            'text': text,
            'filename': filename
        })

    except Exception as e:
        logger.error(f"Unexpected error processing file: {str(e)}")
        
        # Try to clean up any uploaded file if an error occurred
        try:
            if 'file_path' in locals() and os.path.exists(file_path):
                safe_remove_file(file_path)
        except Exception as cleanup_error:
            logger.error(f"Error during file cleanup: {str(cleanup_error)}")
            
        return jsonify({'error': f"Unexpected error processing file {file.filename}: {str(e)}"}), 500

# Run the Flask app if this script is executed directly
if __name__ == '__main__':
    # Get the host and port from environment variables or use defaults
    host = os.environ.get('FLASK_HOST', '0.0.0.0')
    port = int(os.environ.get('FLASK_PORT', 8080))
    debug = os.environ.get('FLASK_DEBUG', 'True').lower() in ('true', '1', 't')
    
    logger.info(f"Starting Flask server on {host}:{port} (debug={debug})")
    app.run(host=host, port=port, debug=debug)

 
