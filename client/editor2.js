import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import { Node } from '@tiptap/core';
import TextStyle from '@tiptap/extension-text-style'
import { Mark } from '@tiptap/core';
const MenuBar = editor => {
  if (!editor) {
    return null;
}

let isCreatingPage = false; // Add this flag at the beginning of the file


// Function to initialize a new editor
const initializeEditor = (element) => {
  const editorInstance = new Editor({
    element: element,
    extensions: [StarterKit, TextAlign.configure({
      types: ['heading', 'paragraph']
    }), Highlight, Font],
    content: '<p>Your resume content here...</p>'
  });

  // Add event listener to check content height
  editorInstance.on('transaction', () => {
    const contentHeight = element.clientHeight;
    const contentScrollHeight = element.scrollHeight;
    const pageHeight = element.closest('.page').offsetHeight - 30;
  
    if (contentScrollHeight > contentHeight && contentHeight >= pageHeight && !isCreatingPage) {
      isCreatingPage = true;
      createNewPage();
      const newEditorElement = document.querySelector('.page:last-child .element');
      const newEditor = initializeEditor(newEditorElement);
      newEditor.focus();
      isCreatingPage = false;
    }
  });

  return editorInstance;
};


// Function to create a new page
const createNewPage = () => {
  const newPage = document.createElement('div');
  newPage.className = 'page';
  newPage.innerHTML = '<div class="editor"><div class="element"></div></div>';
  newPage.onclick = selectPage;

  // Append the new page to the "document" div
  const documentDiv = document.getElementById('document');
  documentDiv.appendChild(newPage);

  // Initialize a new editor instance for the new page
  const newEditorElement = newPage.querySelector('.element');
  initializeEditor(newEditorElement);
};

// Function to handle keydown events
const handleKeyDown = (event) => {
  const editorElement = event.currentTarget;
  const isEnterKey = event.key === 'Enter';

  
};

// Function to select a page
const selectPage = (event) => {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('selected'));
    event.currentTarget.classList.add('selected');
};

// Function to delete the selected page
const deleteSelectedPage = () => {
    const selectedPage = document.querySelector('.page.selected');
    if (selectedPage) {
      selectedPage.remove();
    }
};

  const toolbar = document.createElement('div');
  toolbar.className = 'toolbar';

  // Create Font Selector
  const fontSelector = document.createElement('select');
  Font.options.fonts.forEach(font => {
    const option = document.createElement('option');
    option.innerText = font;
    option.value = font;
    fontSelector.appendChild(option);
  });  

  fontSelector.onchange = (e) => {
    console.log('Selected font:', e.target.value); // Debug statement
    editor.chain().focus().setFontFamily(e.target.value).run(); // use the corrected setFontFamily command
  };

  toolbar.appendChild(fontSelector); // Add font selector to the toolbar

  const buttons = [
    { label: 'h1', action: () => editor.chain().focus().toggleHeading({ level: 1 }).run() },
    { label: 'h2', action: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
    { label: 'h3', action: () => editor.chain().focus().toggleHeading({ level: 3 }).run() },
    { label: 'paragraph', action: () => editor.chain().focus().setParagraph().run() },
    { label: 'bold', action: () => editor.chain().focus().toggleBold().run() },
    { label: 'italic', action: () => editor.chain().focus().toggleItalic().run() },
    { label: 'strike', action: () => editor.chain().focus().toggleStrike().run() },
    { label: 'highlight', action: () => editor.chain().focus().toggleHighlight().run() },
    { label: 'left', action: () => editor.chain().focus().setTextAlign('left').run() },
    { label: 'center', action: () => editor.chain().focus().setTextAlign('center').run() },
    { label: 'right', action: () => editor.chain().focus().setTextAlign('right').run() },
    { label: 'justify', action: () => editor.chain().focus().setTextAlign('justify').run() },
    { label: 'Create New Page', action: createNewPage }, // Create New Page button
    { label: 'Delete Page', action: deleteSelectedPage }, // Delete Page button
  ];

  buttons.forEach(buttonConfig => {
    const button = document.createElement('button');
    button.innerText = buttonConfig.label;
    button.onclick = buttonConfig.action;
    toolbar.appendChild(button);
  });

  return toolbar;
};

//Function to select Font
const Font = Mark.create({
  name: 'font',

  defaultOptions: {
    types: ['heading', 'paragraph'],
    fonts: ['Times New Roman', 'Arial', 'Georgia', 'Helvetica', ],
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontFamily: {
            default: 'Arial',
            renderHTML: attributes => {
              return { style: `font-family: ${attributes.fontFamily}` };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setFontFamily: font => ({ commands }) => {
        console.log('Setting font family to:', font); // Debug statement
        commands.setMark('font', { fontFamily: font }); // use 'font', not 'textStyle', and set fontFamily
      },
    };
  }
});

const editor = new Editor({
  element: document.querySelector('.element'),
  extensions: [StarterKit, TextAlign.configure({
    types: ['heading', 'paragraph']
  }), Highlight,
  TextStyle,
  Font,
  ],
  content: '<p>Your resume content here...</p>'
});

// Function to select a page
const selectPage = (event) => {
  const pages = document.querySelectorAll('.page');
  pages.forEach(page => {
    page.classList.remove('selected');
    page.querySelector('.editor').contentEditable = 'false'; // Make other pages uneditable
  });
  event.currentTarget.classList.add('selected');
  event.currentTarget.querySelector('.editor').contentEditable = 'true'; // Make the selected page editable
};


// Render the MenuBar
document.querySelector('#toolbar-container').prepend(MenuBar(editor));


// Initialize the first editor
const firstEditorElement = document.querySelector('.element');
initializeEditor(firstEditorElement);

// Add click event to the existing page
document.querySelector('.page').onclick = selectPage;

// Add keydown event listener to the editor element
element.addEventListener('keydown', handleKeyDown);

// Function to handle zooming
const handleZoom = (event) => {
  if (event.ctrlKey) {
    const page = document.querySelector('.page');
    if (event.deltaY < 0) {
      page.classList.add('zoomed'); // Zoom in
    } else {
      page.classList.remove('zoomed'); // Zoom out
    }
  }
};

// Add event listener for mouse wheel
document.querySelector('.page-holder').addEventListener('wheel', handleZoom);
