#!/bin/bash

echo "Activating virtual environment..."
. "$HOME/Desktop/Backend/venv/bin/activate"

echo "Freezing current pip packages..."
pip freeze > temp_requirements.txt


echo "Extracting Django version..."
grep "Django>=" requirements.txt > django_version.txt


echo "Removing Django version from temporary requirements..."
grep -v "Django==" temp_requirements.txt > final_requirements.txt


echo "Combining Django version with other requirements..."
cat django_version.txt final_requirements.txt > requirements.txt

echo "Removing temporary files..."
rm django_version.txt temp_requirements.txt final_requirements.txt

echo "Checking if temporary files are removed..."
if [ ! -f django_version.txt ] && [ ! -f temp_requirements.txt ] && [ ! -f final_requirements.txt ]; then
    echo "Temporary files successfully removed."
else
    echo "Error: One or more temporary files were not removed."
fi

echo "Deactivating virtual environment..."
deactivate

echo "\033[0;32mScript completed.\033[0m"
