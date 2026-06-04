content = open('src/pages/DemoPage.jsx', 'r', encoding='utf-8').read()

# Corrige o import errado "./firebase" para "../services/firebase"
content = content.replace(
    'from "./firebase"',
    'from "../services/firebase"'
)
content = content.replace(
    'from "./firebase" ',
    'from "../services/firebase"'
)

open('src/pages/DemoPage.jsx', 'w', encoding='utf-8').write(content)
print('OK - import corrigido')