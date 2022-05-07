# screenshot-api
Take screenshots of websites using direct links

## Usage
```sh
https://ryo-ss.herokuapp.com?link=<url_with_protocol>

# Example
https://ryo-ss.herokuapp.com/?link=https://youtu.be/dQw4w9WgXcQ
```

## Options
Several options are available through query parameters. Multiple parameters are joined using the `&` sign.

### 1. Image size
Default size is `1920x1080` pixel. Use the `size=small` parameter to get a smaller sized (`480x270` pixel) image.
```sh
https://ryo-ss.herokuapp.com/?link=https://google.com&size=small
```

### 2. Image format
Default format is `webp`. Use the `type=png` parameter to get a PNG image.
```sh
https://ryo-ss.herokuapp.com/?link=https://google.com&type=png
```

### 3. Image quality
Default quality is `100` (full quality). Use the `quality=[0-100]` parameter to set the quality of the image. Doesn't work for `png`.
```sh
https://ryo-ss.herokuapp.com/?link=https://google.com&quality=50
```

### 4. Full page
Default is `false`. Use `fp=true` to get the fullscreen screenshot of the page.
```sh
https://ryo-ss.herokuapp.com/?link=https://github.com/ig1711&fp=true
```

### Multiple options example
```
https://ryo-ss.herokuapp.com/?link=https://github.com/ig1711&size=small&type=png&fp=true
```

## Note
Three images are cached in the server. So, subsequent option changes won't work. If you need to clear cache, send a GET request to `https://ryo-ss.herokuapp.com/clearcache`.
