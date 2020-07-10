def validFilename(filename):
    value = filename.replace('/', '_')
    value = value.replace('\"', '\'')
    value = value.replace('|', '_')
    return value

