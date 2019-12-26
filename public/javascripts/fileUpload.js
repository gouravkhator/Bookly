//The imports of various css files in main.css gets loaded after the main.css and all javascripts in javascripts folder gets loaded.
//So, this js will not be able to load variables in those imported css files.

const rootStyles = window.getComputedStyle(document.documentElement); //getting root element styles

if (rootStyles.getPropertyValue('--book-cover-width-large') != null && rootStyles.getPropertyValue('--book-cover-width-large') !== '') {
    ready();
} else {
    //adding event listener to main.css when its fully loaded with all imports
    document.getElementById('main-css').addEventListener('load', ready);
}

function ready() {
    const coverWidth = parseFloat(rootStyles.getPropertyValue('--book-cover-width-large'));
    const coverAspectRatio = parseFloat(rootStyles.getPropertyValue('--book-cover-aspect-ratio'));
    //as getPropertyValue returns String
    const coverHeight = coverWidth / coverAspectRatio;
    FilePond.registerPlugin(
        FilePondPluginImagePreview,
        FilePondPluginImageResize,
        FilePondPluginFileEncode,
    )

    FilePond.setOptions({
        stylePanelAspectRatio: 1 / coverAspectRatio,
        imageResizeTargetWidth: coverWidth,
        imageResizeTargetHeight: coverHeight
    })
    FilePond.parse(document.body);
}