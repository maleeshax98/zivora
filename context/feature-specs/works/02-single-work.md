## Create a `/work/[slug]` page for showing single album

## Context

- We have `/work/` page for showing list of albums
- We have `/work/[slug]` page for showing single album

## Requirements

- Frist showing loading bar like before.
- When loaded show the title and then description and then date fade in fade out animation like a cinemetic intro.
- and then show the images and videos

## UI design

- For images use pinterest type image grid.
- For mobile use two column grid.
- For videos it will give a youtube link so design it
- Create tabs for photos and videos to filter photos and videos. Fixed bottom with a fadeded gradient.

## Backend

- Use infinity scroll and pagination for fetching photos from cloudinary folder.
- Newly loaded photos will be in bottom and already loaded phtos means frist loaded photos in where they was.
