# this script takes a folder name and copies the contents to a json file.
# the json file will be read by the memory game so it knows what kind of images are available

from os import listdir
from os.path import isfile, join
import json

THEME_PATH = "../games/public/themes"
OUTPUT_FILE = "themes.json"

def main():

    entries = listdir(THEME_PATH)

    contents = []

    for i in range(len(entries)):
        name = {
            'theme' : entries[i],
            'images' : listdir(join(THEME_PATH + "/" + entries[i]))
        }
        contents.append(name)

        
    with open(OUTPUT_FILE, "w") as f:
        json.dump(contents, f, indent=4)

    
main()