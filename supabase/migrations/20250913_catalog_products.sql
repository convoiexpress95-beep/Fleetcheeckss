-- Catalogue produits (packs crédits & physiques)
create table if not exists catalog_products (
  id text primary key,
  name text not null,
  base_price numeric not null check (base_price >= 0), -- HT
  kind text not null default 'physical', -- 'credit' | 'physical' | 'service'
  credit_amount int, -- si kind=credit
  active boolean not null default true,
  created_at timestamptz default now()
);

alter table catalog_products enable row level security;
create policy catalog_products_select on catalog_products for select using (active = true);

-- Seed minimal packs (idempotent)
insert into catalog_products (id,name,base_price,kind,credit_amount) values
  ('pack-debutant','Pack Débutant',9.99,'credit',10),
  ('pack-pro','Pack Pro',19.99,'credit',25),
  ('pack-expert','Pack Expert',39.99,'credit',100),
  ('pack-entreprise','Pack Entreprise',79.99,'credit',650)
  on conflict (id) do nothing;
