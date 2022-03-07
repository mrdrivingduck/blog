import os

sub_dirs = os.listdir()
sub_dirs.sort()

all_content = []

for sub_dir in sub_dirs:
    if not os.path.isdir(sub_dir):
        continue

    sub_dir_config = {}
    sub_dir_config["text"] = sub_dir

    sub_dir_files = os.listdir(sub_dir)
    sub_dir_files.sort()
    sub_dir_contents = []
    for file in sub_dir_files:
        sub_dir_contents.append('/notes/' + sub_dir + '/' + file)
    
    sub_dir_config["children"] = sub_dir_contents
    all_content.append(sub_dir_config)

print(all_content)
