FROM lscr.io/linuxserver/beets:1.6.0-ls149

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
