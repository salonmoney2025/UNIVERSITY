"""
Currency utilities for Sierra Leone Leone (SLL)
"""

# Currency configuration
CURRENCY = {
    'code': 'SLL',
    'symbol': 'Le',
    'name': 'Sierra Leone Leone',
    'decimal_places': 2,
}


def format_currency(amount, include_symbol=True):
    """
    Format amount to Sierra Leone Leone currency

    Args:
        amount (Decimal/float): Amount to format
        include_symbol (bool): Whether to include currency symbol

    Returns:
        str: Formatted currency string
    """
    try:
        amount = float(amount)
    except (TypeError, ValueError):
        amount = 0.0

    # Format with thousand separators
    formatted = f"{amount:,.2f}"

    if include_symbol:
        return f"{CURRENCY['symbol']} {formatted}"
    return formatted


def parse_currency(value):
    """
    Parse currency string to float

    Args:
        value (str): Currency string to parse

    Returns:
        float: Parsed amount
    """
    if isinstance(value, (int, float)):
        return float(value)

    # Remove currency symbol and commas
    cleaned = str(value).replace(CURRENCY['symbol'], '').replace(',', '').strip()

    try:
        return float(cleaned)
    except ValueError:
        return 0.0


def get_currency_info():
    """
    Get currency configuration

    Returns:
        dict: Currency configuration
    """
    return CURRENCY.copy()
