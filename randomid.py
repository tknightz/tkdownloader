import random
import string


def get_random_string(length):
    letters = string.ascii_letters
    value = ''.join(random.choice(letters) for i in range(length))
    return value
