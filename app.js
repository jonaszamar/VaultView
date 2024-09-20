document.getElementById('fileInput').addEventListener('change', handleFileSelect);

let editor;
let currentFile = null;
let debugMode = false;

document.addEventListener('DOMContentLoaded', () => {
    editor = ace.edit("editor");
    editor.setTheme("ace/theme/monokai");
    editor.session.setMode("ace/mode/javascript");
    editor.setOptions({
        fontSize: "12pt",
        readOnly: true
    });

    const debugToggle = document.createElement('button');
    debugToggle.textContent = 'Debug Mode';
    debugToggle.addEventListener('click', toggleDebugMode);
    document.querySelector('header').appendChild(debugToggle);

    const fileInfoPanel = document.createElement('div');
    fileInfoPanel.id = 'file-info-panel';
    document.querySelector('main').appendChild(fileInfoPanel);

    setupSidebar();
    disableSaveAndRightClick();
});

function handleFileSelect(event) {
    const files = event.target.files;
    const fileTree = document.getElementById('file-tree');

    fileTree.innerHTML = '';

    const root = { name: 'Root', children: [], type: 'folder' };
    
    for (let file of files) {
        addToFileTree(root, file.webkitRelativePath.split('/'), file);
    }

    renderFileTree(root, fileTree);
}

function addToFileTree(node, pathParts, file) {
    if (pathParts.length === 0) return;

    const childName = pathParts.shift();
    let child = node.children.find(c => c.name === childName);

    if (!child) {
        child = { name: childName, children: [], type: pathParts.length > 0 ? 'folder' : 'file', file: file };
        node.children.push(child);
    }

    if (pathParts.length > 0) {
        addToFileTree(child, pathParts, file);
    }
}

function renderFileTree(node, parentElement) {
    const element = document.createElement('div');
    element.textContent = node.name.split('.').slice(0, -1).join('.') || node.name;
    element.classList.add(node.type);
    element.title = node.name;

    if (node.type === 'file') {
        element.addEventListener('click', () => openFile(node.file));
    }

    parentElement.appendChild(element);

    if (node.children.length > 0) {
        const childrenContainer = document.createElement('div');
        childrenContainer.classList.add('children');
        node.children.forEach(child => renderFileTree(child, childrenContainer));
        parentElement.appendChild(childrenContainer);
    }
}

function openFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const content = e.target.result;
        editor.setValue(content, -1);
        editor.session.setMode(getAceMode(file.name));
        currentFile = file;
        updateFileInfo(file);
    };
    reader.readAsText(file);
}

function getAceMode(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    switch (ext) {
        case 'js': return 'ace/mode/javascript';
        case 'html': return 'ace/mode/html';
        case 'css': return 'ace/mode/css';
        case 'py': return 'ace/mode/python';
        case 'java': return 'ace/mode/java';
        case 'c': return 'ace/mode/c';
        case 'cpp': return 'ace/mode/c_cpp';
        case 'cs': return 'ace/mode/csharp';
        case 'php': return 'ace/mode/php';
        default: return 'ace/mode/text';
    }
}

function toggleDebugMode() {
    debugMode = !debugMode;
    if (debugMode) {
        editor.setValue(JSON.stringify(currentFile, null, 2));
    } else {
        openFile(currentFile);
    }
}


function setupSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.style.width = '300px';
    sidebar.style.overflowX = 'auto';
    sidebar.style.whiteSpace = 'nowrap';
}

function disableSaveAndRightClick() {
    document.addEventListener('contextmenu', event => {
        event.preventDefault();
        event.stopPropagation();
        return false;
    }, true);

    document.addEventListener('keydown', event => {
        if ((event.ctrlKey || event.metaKey) && (event.key === 's' || event.key === 'S')) {
            event.preventDefault();
            event.stopPropagation();
            return false;
        }
    }, true);

    document.addEventListener('cut', event => {
        event.preventDefault();
        event.stopPropagation();
        return false;
    }, true);

    document.addEventListener('paste', event => {
        event.preventDefault();
        event.stopPropagation();
        return false;
    }, true);

    window.addEventListener('beforeprint', event => {
        event.preventDefault();
        event.stopPropagation();
        return false;
    }, true);

    document.addEventListener('dragstart', event => {
        event.preventDefault();
        event.stopPropagation();
        return false;
    }, true);

    window.onbeforeunload = function() {
        return "Changes you made may not be saved.";
    };

    document.addEventListener('selectstart', event => {
        if (event.target.tagName !== 'INPUT' && event.target.tagName !== 'TEXTAREA') {
            event.preventDefault();
            event.stopPropagation();
            return false;
        }
    }, true);

    console.log('Save options and right-click have been disabled. Copying is allowed.');
}

editor.getSession().on('change', () => {
    const wordCount = editor.getValue().split(/\s+/).length;
    document.getElementById('word-count').textContent = `Words: ${wordCount}`;
});
