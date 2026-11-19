import 'preamble.just'
set working-directory := '..'

_default:
    @justz help site

[doc('Serve site/ at http://localhost:8080 for a local preview')]
serve PORT='8080':
    python3 -m http.server "$1" --directory site

[doc('Start the GitHub Pages workflow that publishes site/ from main')]
[confirm('Start the Pages workflow and publish site/ from main?')]
deploy:
    gh workflow run pages.yml --ref main
