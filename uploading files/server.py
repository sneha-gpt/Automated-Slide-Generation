from flask import Flask, request, jsonify  # Flask for web server and handling requests
from flask_cors import CORS  # CORS for handling cross-origin requests
import fitz  # PyMuPDF for PDF processing
import pytesseract  # Tesseract OCR for scanned PDFs
from PIL import Image  # PIL for image processing
import os  # For file and directory operations
from werkzeug.utils import secure_filename  # For securing uploaded file names
import logging  # For logging errors and information

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # This allows all origins by default

# Configure logging
logging.basicConfig(level=logging.INFO)  # Set logging level to INFO
logger = logging.getLogger(__name__)  # Create a logger instance

# Configure upload folder and allowed file extensions
UPLOAD_FOLDER = 'uploads'  # Directory to store uploaded files
ALLOWED_EXTENSIONS = {'pdf', 'txt'}  # Allowed file types

# Create the upload folder if it doesn't exist
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Set the upload folder in Flask app configuration
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename):
    """
    Check if the uploaded file has an allowed extension.
    :param filename: Name of the uploaded file
    :return: True if the file is allowed, False otherwise
    """
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_text_from_pdf(file_path):
    """
    Extract text from PDF files, handling both searchable and scanned PDFs.
    :param file_path: Path to the PDF file
    :return: Extracted text and error message (if any)
    """
    try:
        doc = fitz.open(file_path)  # Open the PDF file
        text = ""  # Initialize text storage
        is_scanned = True  # Flag to check if the PDF is scanned

        # Attempt to extract text from each page
        for page in doc:
            page_text = page.get_text()  # Extract text from the page
            if page_text.strip():  # Check if text is found
                is_scanned = False  # Mark as not scanned
                text += page_text + "\n"  # Append text to the result

        # If no text was found, assume it's a scanned PDF and use OCR
        if is_scanned:
            logger.info(f"Detected scanned PDF: {file_path}")
            for page_num in range(len(doc)):
                page = doc.load_page(page_num)  # Load the page
                pix = page.get_pixmap()  # Render the page as an image
                img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)  # Convert to PIL image
                text += pytesseract.image_to_string(img) + "\n"  # Perform OCR on the image

        doc.close()  # Close the PDF document
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
    try:
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

@app.route('/process', methods=['POST'])
def process_document():
    """
    Endpoint to process uploaded documents (PDF or TXT).
    :return: JSON response with extracted text or error message
    """
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

    try:
        filename = secure_filename(file.filename)  # Secure the file name
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)  # Create file path
        logger.info(f"Saving file to {file_path}")
        file.save(file_path)  # Save the uploaded file

        file_extension = filename.rsplit('.', 1)[1].lower()  # Get file extension
        
        # Process the file based on its extension
        if file_extension == 'pdf':
            text, error = extract_text_from_pdf(file_path)
        else:  # txt file
            text, error = extract_text_from_txt(file_path)

        # Clean up the uploaded file
        os.remove(file_path)
        logger.info(f"File {file_path} removed after processing")

        if error:
            logger.error(f"Error during file processing: {error}")
            return jsonify({'error': f"Error processing file {filename}: {error}"}), 500

        if not text:
            logger.warning(f"No text extracted from {file_path}")
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
        return jsonify({'error': f"Unexpected error processing file {file.filename}: {str(e)}"}), 500

 
