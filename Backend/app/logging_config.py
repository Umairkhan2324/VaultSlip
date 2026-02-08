"""Central logging configuration for the backend.

Uses a simple structured text format and routes all app loggers
through the standard library `logging` system. Avoids logging
secrets or full payloads; callers should only pass safe context.
"""

import logging
from typing import Optional


_configured = False


def configure_logging(level: int = logging.INFO, extra_handlers: Optional[list] = None) -> None:
    """Configure root logging once.

    - Level: INFO by default (override in prod if needed).
    - Format: timestamp, level, logger name, message.
    - extra_handlers: optional list of pre-configured handlers to attach.
    """
    global _configured
    if _configured:
        return

    logging.basicConfig(
        level=level,
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
    )
    if extra_handlers:
        root = logging.getLogger()
        for h in extra_handlers:
            root.addHandler(h)
    _configured = True

