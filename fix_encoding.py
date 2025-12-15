#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os
import glob

# Mapeo de caracteres mal codificados a correctos
replacements = {
    'Ã³': 'ó',
    'Ã­': 'í',
    'Ã¡': 'á',
    'Ã©': 'é',
    'Ãº': 'ú',
    'Ã±': 'ñ',
    'Â¿': '¿',
    'Ã"': 'Ó',
    'Ã': 'Í',
    'Ã': 'Á',
    'Ã‰': 'É',
    'Ãš': 'Ú',
    'Ã': 'Ñ',
    'â€¢': '•',
    # Eliminar emojis mal codificados (según diseño Minimalista Industrial sin iconos)
    'âœ…': '',
    'âš ï¸': '',
    'ðŸ"§': '',
    'ðŸ'¥': '',
    'ðŸ—'ï¸': '',
    'ðŸ"': '',
    'ðŸ"„': '',
    'ðŸŽ‰': '',
    'â‰¡': '',
    'âœ•': '',
    'âœï¸': '',
    'âœ"': '',
    'âŒ': '',
    'â³': '',
    'âž•': '',
    'ðŸ› ï¸': '',
    'â†»': '',
    'â„¹ï¸': '',
    'â†'': '',
    'â†': '',
}

# Buscar todos los archivos .tsx y .ts en frontend/src
os.chdir('frontend/src')
files = glob.glob('**/*.tsx', recursive=True) + glob.glob('**/*.ts', recursive=True)

fixed_count = 0
for filepath in files:
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        for old, new in replacements.items():
            content = content.replace(old, new)
        
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8', newline='\n') as f:
                f.write(content)
            fixed_count += 1
            print(f'Fixed: {filepath}')
    except Exception as e:
        print(f'Error processing {filepath}: {e}')

print(f'\nTotal files fixed: {fixed_count}/{len(files)}')
