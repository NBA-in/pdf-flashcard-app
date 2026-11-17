import sys
import docx
from docx import Document
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING
from docx.enum.style import WD_STYLE_TYPE
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

def add_page_number(run):
    fldChar1 = OxmlElement('w:fldChar')
    fldChar1.set(qn('w:fldCharType'), 'begin')
    instrText = OxmlElement('w:instrText')
    instrText.set(qn('xml:space'), 'preserve')
    instrText.text = "PAGE"
    fldChar2 = OxmlElement('w:fldChar')
    fldChar2.set(qn('w:fldCharType'), 'separate')
    fldChar3 = OxmlElement('w:fldChar')
    fldChar3.set(qn('w:fldCharType'), 'end')
    run._r.append(fldChar1)
    run._r.append(instrText)
    run._r.append(fldChar2)
    run._r.append(fldChar3)

def set_bottom_border(paragraph):
    pPr = paragraph._p.get_or_add_pPr()
    pBdr = OxmlElement('w:pBdr')
    bottom = OxmlElement('w:bottom')
    bottom.set(qn('w:val'), 'single')
    bottom.set(qn('w:sz'), '4')
    bottom.set(qn('w:space'), '1')
    bottom.set(qn('w:color'), 'auto')
    pBdr.append(bottom)
    pPr.append(pBdr)

def set_top_border(paragraph):
    pPr = paragraph._p.get_or_add_pPr()
    pBdr = OxmlElement('w:pBdr')
    top = OxmlElement('w:top')
    top.set(qn('w:val'), 'single')
    top.set(qn('w:sz'), '4')
    top.set(qn('w:space'), '1')
    top.set(qn('w:color'), 'auto')
    pBdr.append(top)
    pPr.append(pBdr)

def create_styles(doc):
    # Base Normal Style
    style = doc.styles['Normal']
    font = style.font
    font.name = 'Times New Roman'
    font.size = Pt(12)
    doc.styles['Normal'].paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    doc.styles['Normal'].paragraph_format.line_spacing = 1.5

    # Chapter/Section Title
    style = doc.styles.add_style('ChapterTitle', WD_STYLE_TYPE.PARAGRAPH)
    font = style.font
    font.name = 'Times New Roman'
    font.size = Pt(18)
    font.bold = True
    style.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER
    style.paragraph_format.space_after = Pt(24)

    # Heading 2
    style = doc.styles.add_style('Heading2', WD_STYLE_TYPE.PARAGRAPH)
    font = style.font
    font.name = 'Times New Roman'
    font.size = Pt(16)
    font.bold = True
    style.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.LEFT
    style.paragraph_format.space_before = Pt(24)
    style.paragraph_format.space_after = Pt(12)

    # Heading 3
    style = doc.styles.add_style('Heading3', WD_STYLE_TYPE.PARAGRAPH)
    font = style.font
    font.name = 'Times New Roman'
    font.size = Pt(14)
    font.bold = True
    style.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.LEFT
    style.paragraph_format.space_before = Pt(18)
    style.paragraph_format.space_after = Pt(6)

def add_chapter(doc, title, chapter_num, include_header=True):
    # Add a new section for the chapter
    if len(doc.paragraphs) > 0:
        doc.add_page_break()
    
    section = doc.sections[-1]
    
    # Optional: if it's the first section, let's configure its footer
    # But usually every chapter starts a new section to have different first page headers
    if len(doc.sections) > 1 or doc.paragraphs:
        section = doc.add_section()

    section.different_first_page_header_footer = True
    
    # First page: No header, footer center
    fp_header = section.first_page_header
    fp_header.is_linked_to_previous = False
    
    fp_footer = section.first_page_footer
    fp_footer.is_linked_to_previous = False
    fp_p = fp_footer.paragraphs[0] if fp_footer.paragraphs else fp_footer.add_paragraph()
    fp_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    add_page_number(fp_p.add_run())

    # Other pages: Header top right, footer bottom right
    header = section.header
    header.is_linked_to_previous = False
    hp = header.paragraphs[0] if header.paragraphs else header.add_paragraph()
    hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    if include_header:
        # Chapter 2: Literature Review, etc.
        hp.text = f"Chapter {chapter_num}: {title}\t\tDept. of CSE, Amal Jyothi College of Engineering "
        set_bottom_border(hp)
        run = hp.runs[0]
        run.font.name = 'Times New Roman'
        run.font.size = Pt(12)

    footer = section.footer
    footer.is_linked_to_previous = False
    ft_p = footer.paragraphs[0] if footer.paragraphs else footer.add_paragraph()
    ft_p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    # set_top_border(ft_p)
    ft_p.add_run("Dept. of CSE, Amal Jyothi College of Engineering\t")
    add_page_number(ft_p.add_run())

    doc.add_paragraph(f"CHAPTER {chapter_num}\n{title.upper()}", style='ChapterTitle')

def main():
    doc = Document()
    create_styles(doc)

    # Front Page pseudo
    p = doc.add_paragraph("A MINI PROJECT REPORT\nON\n", style='ChapterTitle')
    p = doc.add_paragraph("PDF NOTES TO FLASHCARDS", style='ChapterTitle')
    p = doc.add_paragraph("Submitted by\n[Student Name]\n\nin partial fulfillment for the award of the Degree of\nBachelor of Technology\nin\nComputer Science and Engineering", style='Normal')
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    doc.add_page_break()

    # Introduction
    add_chapter(doc, "Introduction", "1")
    p = doc.add_paragraph("1.1 Background", style='Heading2')
    doc.add_paragraph("In recent years, the intersection of artificial intelligence and educational technology has opened new frontiers for interactive learning. The traditional approach to studying relies heavily on reviewing class notes, reading textbooks, and manual summarization. However, transforming these comprehensive notes into an active recall format, such as flashcards, often proves to be a time-consuming and tedious task. Flashcards are widely recognized as one of the most effective study tools due to their foundation in the principles of active recall and spaced repetition. By repeatedly questioning the user and forcing them to retrieve information from memory, flashcards significantly enhance long-term retention compared to passive reading.", style='Normal')
    doc.add_paragraph("To address the inefficiency of manual flashcard creation, this project introduces a web application that automatically generates interactive flashcards directly from PDF notes. By employing advanced Natural Language Processing (NLP) models, specifically the Google Gemini API, the system can understand the context, extract key concepts, and formulate accurate question-and-answer pairs without requiring manual effort. This allows students and professionals to focus their time solely on learning rather than material preparation.", style='Normal')
    
    p = doc.add_paragraph("1.2 Objectives", style='Heading2')
    doc.add_paragraph("The primary objective of this project is to develop an intuitive and efficient web-based platform that processes PDF documents and automatically produces a comprehensive deck of flashcards. The specific goals include:", style='Normal')
    doc.add_paragraph("1. To provide a seamless, drag-and-drop user interface for uploading PDF documents of varying lengths.\n2. To securely and accurately extract text content from the uploaded PDFs and pass it to an AI language model.\n3. To utilize the Google Gemini AI to analyze the text, identify the most pertinent information, and generate concise question-and-answer pairs.\n4. To display the generated flashcards in an interactive, user-friendly viewer with flipping animations and navigation controls.\n5. To implement a backend database system using Firebase Firestore that allows users to save, manage, and retrieve their generated flashcard decks for future study sessions.", style='Normal')

    p = doc.add_paragraph("1.3 Scope of the Project", style='Heading2')
    doc.add_paragraph("The scope of this web application is tailored towards students, educators, and lifelong learners who regularly consume textual information in PDF format. The application is designed to be fully responsive, accessible on both desktop and mobile devices. It includes a user authentication module powered by Firebase, allowing personalized experiences where each user can access their own saved flashcard decks. The AI generation is optimized to handle standard academic and professional texts, avoiding excessive generation times by utilizing asynchronous API calls and prompt engineering. Future scopes include intelligent, spaced-repetition scheduling and multi-file uploads.", style='Normal')

    # Lit Review
    add_chapter(doc, "Literature Review", "2")
    p = doc.add_paragraph("2.1 Existing Systems", style='Heading2')
    doc.add_paragraph("Several platforms exist today that assist in learning and flashcard creation, each with its own advantages and limitations. Quizlet and Anki are the most prominent applications in this domain.", style='Normal')
    
    p = doc.add_paragraph("2.1.1 Quizlet", style='Heading3')
    doc.add_paragraph("Quizlet is a popular web and mobile application that allows users to create sets of terms and definitions. It features various study modes, including match, gravity, and learn modes. While highly interactive, the primary drawback of Quizlet is that it historically relied on manual data entry. Recently, features to scan documents have been added, but they often lack the deep context understanding required to form highly complex, educational questions directly from lengthy PDFs.", style='Normal')

    p = doc.add_paragraph("2.1.2 Anki", style='Heading3')
    doc.add_paragraph("Anki is an open-source flashcard program heavily favored by medical students and language learners for its highly customizable spaced repetition algorithm. Anki ensures long-term retention by adjusting the frequency of flashcards based on user performance. However, Anki has a steep learning curve. The interface is relatively outdated, and creating cards from lecture notes requires significant manual formatting and input.", style='Normal')

    p = doc.add_paragraph("2.2 Proposed Enhancements", style='Heading2')
    doc.add_paragraph("To overcome the limitations of the existing systems, our proposed application automates the generation phase entirely using state-of-the-art Generative AI. By utilizing Gemini's advanced contextual understanding, the app can synthesize information rather than just extracting keywords. Additionally, it wraps this functionality in a modern, intuitive user interface built with React and Tailwind CSS, abstracting away the complexities seen in applications like Anki, while delivering immediate value.", style='Normal')

    # Software Adopted
    add_chapter(doc, "Software Adopted", "3")
    p = doc.add_paragraph("3.1 Introduction", style='Heading2')
    doc.add_paragraph("The development of this application utilized a modern web technology stack, ensuring high performance, scalability, and ease of maintenance. The architecture is divided into the front-end user interface, back-end text processing and logic, data hosting, and AI integration.", style='Normal')

    p = doc.add_paragraph("3.1.1 Front-end Development (React & Vite)", style='Heading3')
    doc.add_paragraph("React, a JavaScript library developed by Facebook, was selected for building the user interface due to its component-based architecture. This allows for reusable UI elements, such as the flashcard viewer, upload components, and navigation bars. Vite was utilized as the build tool, significantly improving the development experience through fast hot-module replacement and optimized production builds. State management was handled using React Hooks, providing a clean and traceable flow of data throughout the application.", style='Normal')

    p = doc.add_paragraph("3.1.2 Styling (Tailwind CSS)", style='Heading3')
    doc.add_paragraph("Tailwind CSS is a utility-first CSS framework that allows for rapid UI development without leaving the HTML/JSX. It was chosen to maintain a consistent design system across the application. The dynamic classes provided by Tailwind made it straightforward to implement modern aesthetics, hover animations, responsive layouts, and dark mode viewing.", style='Normal')

    p = doc.add_paragraph("3.1.3 Back-end & Database (Firebase)", style='Heading3')
    doc.add_paragraph("Google Firebase was integrated for backend services. Specifically, Firebase Authentication handles user sign-up, login, and secure session management. Cloud Firestore, a flexible, scalable NoSQL cloud database, is employed to store the generated flashcard decks persistently. Each deck is linked to a user ID, ensuring data privacy and quick retrieval across multiple devices.", style='Normal')

    p = doc.add_paragraph("3.1.4 Artificial Intelligence (Google Gemini API)", style='Heading3')
    doc.add_paragraph("The core feature of text comprehension and question generation is powered by the Google Gemini API. This large language model was chosen for its exceptional ability to process large contexts, interpret nuances in academic texts, and output strictly formatted JSON responses containing the flashcard data. Prompt engineering techniques were carefully applied to instruct the API to generate concise, accurate, and challenging questions.", style='Normal')

    # Proposed System
    add_chapter(doc, "The Proposed System", "4")
    p = doc.add_paragraph("4.1 System Architecture", style='Heading2')
    doc.add_paragraph("The system follows a client-server architecture with a heavy emphasis on client-side processing to minimize server costs. When a user uploads a PDF, the client application reads the document, extracts the plain text using a client-side PDF parser, and packages this text into an API request. This request, along with specific instructions (prompts), is sent to the Gemini AI via a secure API endpoint. The AI processes the text and returns an array of JSON objects, which the React application then maps into visual, interactive flashcards.", style='Normal')

    p = doc.add_paragraph("4.2 System Workflow", style='Heading2')
    doc.add_paragraph("1. User Initialization: The user navigates to the web application. They may choose to authenticate via Firebase to enable saving features or proceed as a guest.", style='Normal')
    doc.add_paragraph("2. PDF Upload: The user encounters an intuitive drag-and-drop zone. They upload a PDF containing their study material.", style='Normal')
    doc.add_paragraph("3. Text Extraction & AI Processing: The application processes the PDF, extracts the text, and displays a loading state. The text is transmitted to the Gemini API, which generates the flashcards.", style='Normal')
    doc.add_paragraph("4. Interactive Viewing: The generated flashcards are presented on the screen. The user can flip the cards to reveal the answers, navigate between cards, and review the information.", style='Normal')
    doc.add_paragraph("5. Data Persistence: Authenticated users can choose to save the generated deck to their Firestore database, allowing them to access it in the 'My Decks' section during future sessions.", style='Normal')

    # Implementation
    add_chapter(doc, "Implementation", "5")
    p = doc.add_paragraph("5.1 User Interface Development", style='Heading2')
    doc.add_paragraph("The user interface was built with a focus on lack of distraction. A minimalist design approach was taken, utilizing Tailwind CSS to create clean cards with subtle drop shadows. The flashcard component, 'FlashcardViewer.jsx', employs CSS 3D transforms to create a realistic flipping animation when clicked. Icons from the Lucide React library were used for intuitive navigation, such as 'Next', 'Previous', and 'Save'.", style='Normal')

    p = doc.add_paragraph("5.2 API Integration and Prompt Engineering", style='Heading2')
    doc.add_paragraph("Integrating the Gemini API involved setting up the '@google/generative-ai' SDK. A service file, 'gemini.js', abstracts the communication with the API. A critical implementation detail was the prompt design. The prompt instructs the model: 'You are an expert tutor. Analyze the attached text and generate flashcards. Output strictly as JSON containing an array of objects with \"question\" and \"answer\" keys.' This strict formatting ensures the application can seamlessly parse the response and render the UI components without errors.", style='Normal')

    p = doc.add_paragraph("5.3 Error Handling and Validation", style='Heading2')
    doc.add_paragraph("Comprehensive error handling was implemented to ensure a robust user experience. If a user attempts to upload a non-PDF file, or a file exceeding the size limit, appropriate visual alerts are triggered. Furthermore, if the AI fails to generate cards due to rate limits or unreadable text, the application catches the exact exception and displays a friendly error message, allowing the user to retry or modify their document.", style='Normal')

    # Conclusion
    add_chapter(doc, "Conclusion and Future Works", "6")
    p = doc.add_paragraph("6.1 Conclusion", style='Heading2')
    doc.add_paragraph("This project successfully demonstrated the viability of integrating Generative AI into educational tools to vastly improve learning efficiency. The developed web application provides a seamless pipeline from raw, unstructured PDF text to highly structured, interactive study materials. By eliminating the manual effort traditionally required to create flashcards, students and professionals can utilize active recall strategies more frequently. The robust combination of React, Firebase, and Gemini AI resulted in a responsive, scalable, and intelligent application.", style='Normal')

    p = doc.add_paragraph("6.2 Future Works", style='Heading2')
    doc.add_paragraph("While the current implementation fulfills its primary objectives, several enhancements are planned for future iterations. The integration of an advanced Spaced Repetition Algorithm (similar to the SM-2 algorithm used by Anki) will actively schedule flashcard reviews based on the user's performance, optimizing long-term retention. Additionally, expanding the supported file formats to include Word documents (.docx), PowerPoint presentations (.pptx), and direct web URLs will broaden the application's utility. Finally, collaborative features, allowing users to publish and share their decks within a community forum, will be explored to foster a collaborative learning environment.", style='Normal')

    # Bibliography
    add_chapter(doc, "Bibliography", "7", include_header=False) # Often bib doesn't have a chapter number, but keeping simple
    doc.add_paragraph("[1] React Documentation, \"Getting Started with React\", Meta Platforms, 2024. URL: https://react.dev/", style='Normal')
    doc.add_paragraph("[2] Tailwind CSS Documentation, \"Utility-First Fundamentals\", Tailwind Labs, 2024. URL: https://tailwindcss.com/docs", style='Normal')
    doc.add_paragraph("[3] Google Gemini API Documentation, \"Build with Gemini\", Google, 2024. URL: https://ai.google.dev/", style='Normal')
    doc.add_paragraph("[4] Firebase Documentation, \"Firebase Authentication & Cloud Firestore\", Google, 2024. URL: https://firebase.google.com/docs", style='Normal')
    doc.add_paragraph("[5] H. L. Roediger and J. D. Karpicke, \"Test-Enhanced Learning: Taking Memory Tests Improves Long-Term Retention,\" Psychological Science, vol. 17, no. 3, pp. 249-255, 2006.", style='Normal')

    # Appendix A
    add_chapter(doc, "Appendix A", "A", include_header=False)
    p = doc.add_paragraph("Sample Code", style='Heading2')
    
    import os
    src_dir = 'src'
    file_counter = 1
    for root, dirs, files in sorted(os.walk(src_dir)):
        for file in sorted(files):
            if file.endswith(('.jsx', '.js', '.css', '.html')):
                filepath = os.path.join(root, file)
                doc.add_paragraph(f"{file_counter}. {file}", style='Heading3')
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()
                        code_paragraph = doc.add_paragraph(content, style='Normal')
                        code_paragraph.paragraph_format.first_line_indent = Inches(0)
                        code_paragraph.paragraph_format.left_indent = Inches(0.5)
                        # Remove justification for code to avoid weird gaps
                        code_paragraph.alignment = WD_ALIGN_PARAGRAPH.LEFT
                except Exception as e:
                    doc.add_paragraph(f"Error reading {file}: {str(e)}", style='Normal')
                file_counter += 1

    doc.save("Mini_Project_Report.docx")
    print("Report generated successfully as Mini_Project_Report.docx")

if __name__ == "__main__":
    main()
