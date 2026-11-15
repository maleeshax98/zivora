## Fetch albums and show them in works page `/works`

## Frontend Context

- When loading show a little loading bar on the top of the site
- When loaded show cinematic entrance text ("ALL WORKS") and hide it
- Then show the albums under the title "All Works" (not "Selected Works")
- Show category filters on top of the section, starting with an option called "ALL"
- When a user clicks a category, display the category cover image as a faded background with a smooth gradient overlay melting into the canvas, and render the category name directly on top of it
- Maintain active category in URL parameters (e.g. `?category=wedding-photography`) so the filtered view is shareable
- Implement infinite scroll feature
- While loading next albums do not clear whole album page; show loading text at the bottom
- Keep the design clean, human, and editorial; avoid an artificial "AI look" with excessive symbols, slashes, or unnecessary metadata text

  ## Card

       - There will be a cover image
       - There will be album name and date below the image
       - Link the title and image to single album page (`/works/${slug}`) but do not implement the page yet

## Backend Context

- Fetch albums with pagination (support all albums and category-filtered queries)
- Fetch categories for category navigation (`_id`, `title`, `slug`, `coverImage`)
