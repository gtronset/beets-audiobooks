# beets-audiobooks: Organize Your Audiobook Collection With Beets

[![MIT license][license image]][license link]

This bundles up the excellent pllugin [beets-audible] plugin with the very
excellent [beets] tool in a Docker Container.

## Installation

1. Save the following as the docker-compose file:

   ```yaml
   ---
   version: "3"
   services:
     beets-audiobooks:
       image: ghcr.io/gtronset/beets-audiobooks
       container_name: beets-audiobooks
       environment:
         # Update as needed
         - PUID=1000
         - PGID=1000
         - TZ=America/Los_Angeles
       volumes:
         - ./config:/config
         - /path/to/audiobooks:/audiobooks
         - /path/to/import/books/from:/input
       restart: unless-stopped
   ```

2. Spin up the container: `docker-compose up -d`
3. Update the config in `config/config.yaml` as described
   [in the `beets-audible` documentation][beets-audible info].
4. In the docker container, run the `beet --version` command and verify that
   the audible plugin appears in the list of plugins.

## Usage

See full instructions on usage on the [beets-audible repo].

## License

Copyright (c) 2022 Gavin Tronset

Licensed under the [MIT license][license link].

[license image]: https://img.shields.io/badge/License-MIT-blue.svg
[license link]: https://github.com/gtronset/beets-audiobooks/blob/main/LICENSE
[beets-audible]: https://github.com/Neurrone/beets-audible
[beets]: https://github.com/beetbox/beets
[beets-audible info]: https://github.com/Neurrone/beets-audible#installation
[beets-audible repo]: https://github.com/Neurrone/beets-audible#usage
