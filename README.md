# Automated-Slide-Generation

AutoSlide is an interactive web application that converts research papers, reports, or documents into clean, customizable PowerPoint presentations. It uses advanced NLP transformers to extract and summarize document content and offers a real-time preview editor with voice-based customization features.

This tool is especially useful for researchers, students, and professionals who frequently present textual documents and want to skip the manual slide creation process.

---

## 🧰 Features

✅ Upload multiple files (PDF, DOC, DOCX)
✅ Intelligent section-wise summarization: Abstract, Introduction, Methodology, etc.
✅ Extracts key bullet points using LLMs
✅ Scrollable real-time slide preview
✅ Edit slide titles and points manually or via voice (Web Speech API)
✅ Customize fonts, colors, layout
✅ Export to .pptx using python-pptx
✅ Elegant slide animations using GSAP.js
✅ Easy-to-extend backend and frontend architecture

---

## 🌐 Live Demo

Coming soon… (Deploy on Render/Heroku/Vercel or localhost)

---

## 📸 Preview

(coming soon (: )

---

## 🏗️ Tech Stack

| Layer          | Tech                                            |
| -------------- | ----------------------------------------------- |
| Frontend       | HTML, CSS, JavaScript, Web Speech API, GSAP.js  |
| Backend        | Python Flask                                    |
| NLP Models     | Hugging Face Transformers                       |
| PDF Processing | PyMuPDF (fitz)                                  |
| DOCX Parsing   | python-docx                                     |
| Summarization  | allenai/led-base-16384, facebook/bart-large-cnn |
| PPT Creation   | python-pptx                                     |

---

## 🗂️ Project Structure

AutoSlide/
├── backend/
│   ├── app.py                  # Flask server
│   ├── extract\_text.py         # PDF/DOCX text extraction
│   ├── summarize.py            # HuggingFace summarization logic
│   ├── generate\_ppt.py         # Generates PowerPoint using python-pptx
│   └── utils.py                # Helpers
├── templates/
│   ├── index.html              # File upload page
│   ├── customize.html          # Live preview and customization page
├── static/
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── customize.js        # Voice commands, animations
├── models/
│   └── (optional model scripts / checkpoints)
├── requirements.txt
└── README.md

---

## 🛠️ Installation & Usage

1. Clone the repository:

git clone
cd AutoSlide

2. Create a virtual environment & activate it:

python3 -m venv venv
source venv/bin/activate      # On Windows: venv\Scripts\activate

3. Install dependencies:

pip install -r requirements.txt

4. Run the app:

python server.py

5. Open your browser and go to:

[http://localhost:8080](http://localhost:8080)

---

## 🧠 Voice Commands (Web Speech API)

You can edit slides using simple voice commands (Chrome recommended):

* “Change heading to My Research Overview”
* “Update point one to This is the key finding”
* “Set font to Arial”
* “Change layout to grid”
* “Change color to dark theme”

---

## 🤖 NLP Pipeline Overview

For each uploaded file:

1. Text is extracted (via PyMuPDF or python-docx)
2. Document is segmented by semantic headings
3. Each section is summarized using LED (for long inputs) or BART (for shorter sections)
4. Bullet points are generated using BART or sentence-level tokenization
5. Slides are rendered in the frontend with editable content
6. Final export to .pptx using python-pptx

---

## 👩‍💻 Contributing

We welcome contributions! Here's how:

1. Fork the repo
2. Create your feature branch: git checkout -b feature/your-feature
3. Commit your changes: git commit -m "Add some feature"
4. Push to the branch: git push origin feature/your-feature
5. Open a pull request

### Good First Issues

* Add multilingual summarization support
* Improve slide design themes (dark, corporate, academic)
* Add support for embedded images using OpenAI/CLIP or BLIP-2
* Dockerize the app for easy deployment

---

## 📝 License

This project is licensed under the MIT License — see the LICENSE file for details.

---

## 📚 References & Inspiration

This work builds upon ideas from:

1. Fu, T.-J., et al. "DOC2PPT: Automatic Presentation Slides Generation from Scientific Documents." AAAI Conference on Artificial Intelligence, 2022.
2. Weitzman, L. "Automatic Presentation of Multimedia Using Relational Grammars." MIT Media Laboratory, 1994.
3. Gupta, T. "Automatic Presentation Slide Generation Using LLMs." San Jose State University, 2023.
4. Mansoor, M. "AI-Based Presentation Creator with Customized Audio Content Delivery." PES University, 2021.
5. Shreewastav, A., et al. "Presentify: Automated Presentation Slide Generation from Research Papers Using NLP and Deep Learning." IOE, Thapathali Campus, 2024.
6. Shaj, K., et al. "Learning-Based Slide Generator." St. Thomas College of Engineering and Technology, 2023.
7. UTIYAMA, M., HASIDA, K. "Automatic Slide Presentation from Semantically Annotated Documents." Shinshu University & Electrotechnical Laboratory, 1999.
8. Bagdanov, A. D., Klein, B. "Proceedings of the Third International Workshop on Document Layout Interpretation and its Applications (DLIA2003)." DFKI, 2003.
9. Muthazhagan, B., et al. "A Text Mining Approach to Generate PowerPoint Presentations Using Machine Learning Algorithms." Middle-East Journal of Scientific Research, 2016.

---

## 🙋‍♂️ Maintainers

Created with ❤️ by Shiva Jadiya, Sneha Gupta, Vaidik Jaiswal
📍 Bhopal, Madhya Pradesh, India
📧 [vaidikjaiswal@gmail.com](mailto:vaidikjaiswal@gmail.com) 
📧 [shivajadiya2005@gmail.com](mailto:shivajadiya2005@gmail.com) 
📧 [snehagpt1810@gmail.com](mailto:snehagpt1810@gmail.com) 
    


