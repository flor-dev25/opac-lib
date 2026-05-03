use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Author {
    pub author: String,
    pub author_code: i32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CatalogEntry {
    pub controlno: String,
    pub title: String,
    pub callno: Option<String>,
    pub author_code: i32,
    pub edition: Option<String>,
    pub pagination: Option<String>,
    pub publisher: Option<String>,
    pub pubplace: Option<String>,
    pub copyright: Option<String>,
    pub isbn: Option<String>,
    pub subject1_code: Option<i32>,
    pub subject2_code: Option<i32>,
    pub subject3_code: Option<i32>,
    pub series_title: Option<String>,
    pub a_entry_title: Option<String>,
    pub ae_author1_code: Option<i32>,
    pub ae_author2_code: Option<i32>,
    pub ae_author3_code: Option<i32>,
    pub material: Option<String>,
    pub x_notes: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Holdings {
    pub controlno: String,
    pub accession: String,
    pub copy: String,
    pub location: String,
    pub due_date: Option<String>, // simplified for now
    pub status: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CatalogRecord {
    pub id: i32,
    pub controlno: String,
    pub title: String,
    pub author: String,
    pub callno: Option<String>,
    pub year: Option<String>,
}
