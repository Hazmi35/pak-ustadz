# pak-ustadz

**Bot ini dibuat agar kita tidak batal puasa hanya karena tidak sengaja membuka channel nsfw Discord**

<a href='https://discord.com/api/oauth2/authorize?client_id=954016653836943431&permissions=412585610320&scope=bot%20applications.commands'><img src="https://img.shields.io/static/v1?label=Invite%20Me&message=Pak+Ustadz%239319&plastic&color=7289DA&logo=discord"></a>
<a href='https://github.com/Hazmi35/pak-ustadz/actions?query=workflow%3A%22Lint+code+%26+compile+test%22'><img src='https://github.com/Hazmi35/jukebox/workflows/Lint%20code%20&%20compile%20test/badge.svg' alt='CI Status' /></a>
<img src="https://badgen.net/badge/icon/typescript?icon=typescript&label">

## Cara menggunakan
Invite bot ini ke server yang dipilih, untuk pengurus server, lakukan perintah /konfig, untuk pengguna biasa, lakukan perintah /daftar.
Sisanya, bot akan mengurus channel channel yang ditandai sebagai channel NSFW / Age restricted

## Self-host

1. Jika kamu menggunakan Docker, lakukan ini:

    1.1 Pakai Docker image yang sudah tersedia:
         [hazmi35/pak-ustadz](https://hub.docker.com/r/hazmi35/pak-ustadz) atau [ghcr.io/Hazmi35/pak-ustadz](https://ghcr.io/Hazmi35/pak-ustadz)

    1.2 Salin `.env.example` menjadi `.env` dan isi file tersebut.

    1.3 Nyalakan bot
    ```sh
    $ docker run --name PakUstadz --detach --env-file .env --volume $PWD/pak-ustadz-data:/app/data --volume $PWD/pak-ustadz-logs:/app/logs hazmi35/pak-ustadz:latest
    ```
    1.4 Kamu juga bisa menggunakan docker-compose untuk ini, dan perlu diingat untuk menambahkan docker volume untuk data SQLite.
2. Jika kamu tidak menggunakan Docker, lakukan ini:

    2.1 Install project dependencies:
    ```sh
    $ npm clean-install
    ```
    2.2 Build project
    ```sh
    $ npm run build
    ```
    2.3 (Opsional) Hapus devDependencies untuk menghemat ruang
    ```sh
    $ npm prune --production
    ```
    2.4 Salin `.env.example` menjadi `.env` dan isi file tersebut.

    2.5 Nyalakan bot
    ```sh
    $ npm run start
    ```