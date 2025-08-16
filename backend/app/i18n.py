import json
from fastapi import Request

# Ładujemy tłumaczenia
translations = {
    "pl": json.load(open("app/locales/pl.json", encoding="utf-8")),
    "en": json.load(open("app/locales/en.json", encoding="utf-8")),
}

def get_lang(request: Request) -> str:
    lang = request.headers.get("Accept-Language", "en")[:2]
    return lang if lang in translations else "en"

def t(key: str, lang: str = "en", **kwargs) -> str:
    """ Pobiera tłumaczenie po kluczu z opcją podstawienia zmiennych """
    parts = key.split(".")
    ref = translations.get(lang, translations["en"])
    for p in parts:
        ref = ref.get(p, {})
    if isinstance(ref, str):
        return ref.format(**kwargs)
    return key
