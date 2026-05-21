-- Migration v4: per-site custom AGB text
alter table sites add column if not exists agb_text text;
