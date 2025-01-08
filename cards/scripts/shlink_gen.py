import random
import string

random.seed(1)

def generate_url(slug):
    return f"https://s.llev.me/{slug}"

def generate_command(slug, url):
    return f"docker exec -it my_shlink shlink short-url:create -t gift -c {slug} -- {url};"

def generate_commands_loop(slugs, url):
    slugs_str = " ".join(slugs[20:])
    command = generate_command('$code', url)
    return f"for code in {slugs_str}; do\n{command}\ndone"

def generate_slug(n):
    return "".join(random.choices(string.ascii_letters + string.digits, k=n))

def generate_urls(n, slug_length=5):
    slugs = [generate_slug(slug_length) for _ in range(n)]
    
    url = "https://example.com"
    print(generate_commands_loop(slugs, url))
    

    print("urls:")
    for slug in slugs:
        url = generate_url(slug)
        print(url)


generate_urls(24)
