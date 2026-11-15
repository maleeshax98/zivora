import { defineQuery } from 'next-sanity'

export const ALBUMS_QUERY = defineQuery(`
  *[_type == "album" && defined(slug.current)] | order(publishedAt desc, _createdAt desc){
    _id,
    title,
    slug,
    description,
    eventDate,
    cloudinaryFolderName,
    coverImage,
    youtubeVideoLinks,
    publishedAt,
    category->{
      _id,
      title,
      slug
    }
  }
`)

export const ALBUM_BY_SLUG_QUERY = defineQuery(`
  *[_type == "album" && (slug.current == $slug || _id == $slug)][0]{
    _id,
    title,
    slug,
    description,
    eventDate,
    cloudinaryFolderName,
    coverImage,
    youtubeVideoLinks,
    publishedAt,
    category->{
      _id,
      title,
      slug,
      description,
      coverImage
    }
  }
`)

export const CATEGORIES_QUERY = defineQuery(`
  *[_type == "category" && defined(slug.current)] | order(publishedAt asc, _createdAt asc){
    _id,
    title,
    slug,
    description,
    coverImage,
    publishedAt
  }
`)

export const HERO_IMAGES_QUERY = defineQuery(`
  *[_type == "heroImages" && defined(slug.current)] | order(publishedAt asc, _createdAt asc)[0...6]{
    _id,
    title,
    slug,
    coverImage,
    publishedAt
  }
`)

export const FEATURED_ALBUMS_QUERY = defineQuery(`
  *[_type == "album" && defined(slug.current) && featured == true] | order(publishedAt desc, _createdAt desc){
    _id,
    title,
    slug,
    description,
    eventDate,
    cloudinaryFolderName,
    coverImage,
    youtubeVideoLinks,
    featured,
    publishedAt,
    category->{
      _id,
      title,
      slug
    }
  }
`)

export const FEEDBACKS_QUERY = defineQuery(`
  *[_type == "feedback"] | order(publishedAt desc, _createdAt desc)[0...5]{
    _id,
    name,
    tag,
    feedback,
    imageUrl,
    publishedAt
  }
`)

export const WORKS_PAGE_ALBUMS_QUERY = defineQuery(`
  *[_type == "album" && defined(slug.current)] | order(publishedAt desc, _createdAt desc)[$start...$end]{
    _id,
    title,
    slug,
    description,
    eventDate,
    cloudinaryFolderName,
    coverImage,
    youtubeVideoLinks,
    publishedAt,
    category->{
      _id,
      title,
      slug
    }
  }
`)

export const WORKS_TOTAL_COUNT_QUERY = defineQuery(`
  count(*[_type == "album" && defined(slug.current)])
`)

export const WORKS_CATEGORY_ALBUMS_QUERY = defineQuery(`
  *[_type == "album" && defined(slug.current) && category->slug.current == $categorySlug] | order(publishedAt desc, _createdAt desc)[$start...$end]{
    _id,
    title,
    slug,
    description,
    eventDate,
    cloudinaryFolderName,
    coverImage,
    youtubeVideoLinks,
    publishedAt,
    category->{
      _id,
      title,
      slug
    }
  }
`)

export const WORKS_CATEGORY_TOTAL_COUNT_QUERY = defineQuery(`
  count(*[_type == "album" && defined(slug.current) && category->slug.current == $categorySlug])
`)


