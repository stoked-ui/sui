use crate::client::{parse_optional_json_body, print_value, ApiClient};
use crate::commands::JsonBodyArgs;
use crate::config::StoredConfig;
use anyhow::{anyhow, bail, Context, Result};
use clap::Subcommand;
use reqwest::Method;
use serde_json::{json, Value};

#[derive(Debug, Subcommand)]
pub enum BlogCommand {
    /// List authenticated posts (draft/published/archived)
    List {
        #[arg(long)]
        page: Option<u32>,
        #[arg(long)]
        limit: Option<u32>,
        #[arg(long)]
        search: Option<String>,
        #[arg(long)]
        tag: Option<String>,
        #[arg(long)]
        status: Option<String>,
        #[arg(long)]
        author: Option<String>,
        #[arg(long)]
        site: Option<String>,
        #[arg(long)]
        sort_by: Option<String>,
    },
    /// List public published posts
    Public {
        #[arg(long)]
        page: Option<u32>,
        #[arg(long)]
        limit: Option<u32>,
        #[arg(long)]
        search: Option<String>,
        #[arg(long)]
        tag: Option<String>,
        #[arg(long)]
        author: Option<String>,
        #[arg(long)]
        site: Option<String>,
        #[arg(long)]
        sort_by: Option<String>,
    },
    /// Fetch one post by slug
    Get { slug: String },
    /// Create a new blog post
    Create {
        /// Post title
        #[arg(short, long)]
        title: String,
        /// Post body (markdown). Use @file.md to read from a file
        #[arg(short, long)]
        body: String,
        /// Short description / excerpt
        #[arg(short, long)]
        description: Option<String>,
        /// Tags (comma-separated, e.g. "rust,cli,release")
        #[arg(long, value_delimiter = ',')]
        tags: Option<Vec<String>>,
        /// Author name(s) (comma-separated; defaults to your logged-in name)
        #[arg(long, value_delimiter = ',')]
        authors: Option<Vec<String>>,
        /// Custom slug (auto-generated from title if omitted)
        #[arg(long)]
        slug: Option<String>,
        /// Cover image URL
        #[arg(long)]
        image: Option<String>,
        /// Target sites (comma-separated)
        #[arg(long, value_delimiter = ',')]
        sites: Option<Vec<String>>,
        /// Advanced: full JSON payload (overrides all other flags)
        #[command(flatten)]
        json_body: JsonBodyArgs,
    },
    /// Update a post by slug
    Update {
        slug: String,
        #[command(flatten)]
        body: JsonBodyArgs,
    },
    /// Soft delete a post by slug
    Delete {
        slug: String,
        #[arg(long)]
        yes: bool,
    },
    /// Publish a post by slug
    Publish { slug: String },
    /// Unpublish a post by slug
    Unpublish { slug: String },
    /// List tag counts
    Tags,
    /// List author counts
    Authors,
}

pub async fn run_blog(client: &ApiClient, cfg: &StoredConfig, command: BlogCommand, compact_json: bool) -> Result<()> {
    let value = match command {
        BlogCommand::List {
            page,
            limit,
            search,
            tag,
            status,
            author,
            site,
            sort_by,
        } => {
            let query = list_query(page, limit, search, tag, status, author, site, sort_by);
            client
                .request_json(Method::GET, "/blog", &query, None, true)
                .await?
        }
        BlogCommand::Public {
            page,
            limit,
            search,
            tag,
            author,
            site,
            sort_by,
        } => {
            let query = list_query(page, limit, search, tag, None, author, site, sort_by);
            client
                .request_json(Method::GET, "/blog/public", &query, None, false)
                .await?
        }
        BlogCommand::Get { slug } => {
            let path = format!("/blog/{}", slug);
            // This endpoint allows public reads for published posts.
            client
                .request_json(Method::GET, &path, &[], None, false)
                .await?
        }
        BlogCommand::Create {
            title,
            body,
            description,
            tags,
            authors,
            slug,
            image,
            sites,
            json_body,
        } => {
            // If raw JSON provided, use it directly (advanced usage)
            let payload = if let Ok(Some(raw)) =
                parse_optional_json_body(json_body.data_json.as_ref(), json_body.data_file.as_ref())
            {
                raw
            } else {
                // Read body from file if prefixed with @
                let body_text = if body.starts_with('@') {
                    std::fs::read_to_string(&body[1..])
                        .with_context(|| format!("Could not read body file: {}", &body[1..]))?
                } else {
                    body
                };

                // Default author to the logged-in user's name
                let authors = authors.unwrap_or_else(|| {
                    cfg.name
                        .clone()
                        .map(|n| vec![n])
                        .unwrap_or_else(|| vec!["Unknown".to_string()])
                });

                let tags = tags.unwrap_or_default();

                // Auto-generate description from first 160 chars of body if not provided
                let description = description.unwrap_or_else(|| {
                    let plain = body_text.trim();
                    if plain.len() <= 160 {
                        plain.to_string()
                    } else {
                        format!("{}…", &plain[..157])
                    }
                });

                let mut payload = json!({
                    "title": title,
                    "body": body_text,
                    "description": description,
                    "tags": tags,
                    "authors": authors,
                });

                if let Some(s) = slug {
                    payload["slug"] = json!(s);
                }
                if let Some(img) = image {
                    payload["image"] = json!(img);
                }
                if let Some(s) = sites {
                    payload["targetSites"] = json!(s);
                }

                payload
            };

            client
                .request_json(Method::POST, "/blog", &[], Some(payload), true)
                .await?
        }
        BlogCommand::Update { slug, body } => {
            let payload = required_body(&body)?;
            let path = format!("/blog/{}", slug);
            client
                .request_json(Method::PATCH, &path, &[], Some(payload), true)
                .await?
        }
        BlogCommand::Delete { slug, yes } => {
            if !yes {
                bail!("Refusing to delete without --yes");
            }
            let path = format!("/blog/{}", slug);
            client
                .request_json(Method::DELETE, &path, &[], None, true)
                .await?
        }
        BlogCommand::Publish { slug } => {
            let path = format!("/blog/{}/publish", slug);
            client
                .request_json(Method::POST, &path, &[], None, true)
                .await?
        }
        BlogCommand::Unpublish { slug } => {
            let path = format!("/blog/{}/unpublish", slug);
            client
                .request_json(Method::POST, &path, &[], None, true)
                .await?
        }
        BlogCommand::Tags => {
            client
                .request_json(Method::GET, "/blog/tags", &[], None, false)
                .await?
        }
        BlogCommand::Authors => {
            client
                .request_json(Method::GET, "/blog/authors", &[], None, false)
                .await?
        }
    };

    print_value(&value, compact_json)
}

fn list_query(
    page: Option<u32>,
    limit: Option<u32>,
    search: Option<String>,
    tag: Option<String>,
    status: Option<String>,
    author: Option<String>,
    site: Option<String>,
    sort_by: Option<String>,
) -> Vec<(String, String)> {
    let mut query = Vec::new();

    if let Some(v) = page {
        query.push(("page".to_string(), v.to_string()));
    }
    if let Some(v) = limit {
        query.push(("limit".to_string(), v.to_string()));
    }
    if let Some(v) = search {
        query.push(("search".to_string(), v));
    }
    if let Some(v) = tag {
        query.push(("tag".to_string(), v));
    }
    if let Some(v) = status {
        query.push(("status".to_string(), v));
    }
    if let Some(v) = author {
        query.push(("author".to_string(), v));
    }
    if let Some(v) = site {
        query.push(("site".to_string(), v));
    }
    if let Some(v) = sort_by {
        query.push(("sortBy".to_string(), v));
    }

    query
}

fn required_body(body: &JsonBodyArgs) -> Result<Value> {
    parse_optional_json_body(body.data_json.as_ref(), body.data_file.as_ref())?
        .ok_or_else(|| anyhow!("Missing payload. Provide --data-json or --data-file."))
}
