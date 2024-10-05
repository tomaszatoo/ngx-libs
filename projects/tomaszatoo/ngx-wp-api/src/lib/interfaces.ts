// Interface for Post
export interface Post {
    id: number;
    date: string; // ISO 8601 date string
    date_gmt: string; // ISO 8601 date string in GMT
    guid: { rendered: string }; // The post's URL
    modified: string; // Last modified date
    modified_gmt: string; // Last modified date in GMT
    slug: string; // Post slug
    status: string; // Status of the post (e.g., 'publish', 'draft')
    type: string; // Type of post (e.g., 'post', 'page')
    link: string; // URL to the post
    title: { rendered: string }; // Rendered title
    content: { rendered: string }; // Rendered content
    excerpt: { rendered: string }; // Rendered excerpt
    author: number; // ID of the author
    featured_media: number; // ID of the featured media
    comment_status: string; // Comment status ('open' or 'closed')
    ping_status: string; // Ping status ('open' or 'closed')
    sticky: boolean; // Is this post sticky?
    template: string; // Template used for the post
    format: string; // Format of the post
    categories: number[]; // Array of category IDs
    tags: number[]; // Array of tag IDs
  }
  
  // Interface for Category
  export interface Category {
    id: number;
    count: number; // Count of posts in this category
    description: string; // Description of the category
    link: string; // URL to the category
    name: string; // Name of the category
    slug: string; // Slug for the category
    taxonomy: string; // Taxonomy (should be 'category')
  }
  
  // Interface for Tag
  export interface Tag {
    id: number;
    count: number; // Count of posts in this tag
    description: string; // Description of the tag
    link: string; // URL to the tag
    name: string; // Name of the tag
    slug: string; // Slug for the tag
  }
  
  // Interface for Media
  export interface Media {
    id: number;
    date: string; // Date of upload
    date_gmt: string; // Date of upload in GMT
    guid: { rendered: string }; // URL to the media
    link: string; // URL to the media's page
    title: { rendered: string }; // Rendered title
    author: number; // ID of the author
    media_type: string; // Type of media (e.g., 'image', 'video')
    mime_type: string; // MIME type (e.g., 'image/jpeg')
    source_url: string; // URL to the media file
    alt_text: string; // Alt text for accessibility
    caption: { rendered: string }; // Rendered caption
    description: { rendered: string }; // Rendered description
  }
  
  // Interface for User
  export interface User {
    id: number;
    name: string; // User's display name
    slug: string; // User's slug
    email: string; // User's email
    roles: string[]; // Roles assigned to the user
    link: string; // URL to the user's profile
  }
  
  // Interface for Page
  export interface Page {
    id: number;
    date: string; // ISO 8601 date string
    date_gmt: string; // ISO 8601 date string in GMT
    guid: { rendered: string }; // The page's URL
    modified: string; // Last modified date
    modified_gmt: string; // Last modified date in GMT
    slug: string; // Page slug
    status: string; // Status of the page (e.g., 'publish', 'draft')
    type: string; // Type of post (should be 'page')
    link: string; // URL to the page
    title: { rendered: string }; // Rendered title
    content: { rendered: string }; // Rendered content
    excerpt: { rendered: string }; // Rendered excerpt
    author: number; // ID of the author
    featured_media: number; // ID of the featured media
    comment_status: string; // Comment status ('open' or 'closed')
    ping_status: string; // Ping status ('open' or 'closed')
    template: string; // Template used for the page
  }
  
  // Interface for Menu Item
  export interface MenuItem {
    ID: number; // Menu item ID
    title: string; // Title of the menu item
    url: string; // URL of the menu item
    children: MenuItem[]; // Submenu items
    order: number; // Order in the menu
    object_id: number; // ID of the associated object (e.g., post or page)
    object: string; // Object type (e.g., 'post', 'page')
  }
  
  // Interface for Menu
  export interface Menu {
    term_id: number; // Menu ID
    name: string; // Name of the menu
    slug: string; // Slug of the menu
    description: string; // Description of the menu
    items: MenuItem[]; // Menu items
  }
  
  // Interface for Site Info
  export interface SiteInfo {
    name: string; // Site name
    description: string; // Site description
    url: string; // Site URL
    home: string; // Home URL
  }
  