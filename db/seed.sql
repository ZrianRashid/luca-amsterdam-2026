-- LUCA Amsterdam — Seed data
-- Mirrors SERVICES + ADDONS arrays from reserve.jsx so the existing UI keeps working.
-- Re-runnable: uses upsert.

insert into services (id, category, name_nl, name_en, desc_nl, desc_en, duration_min, price_cents, requires_guests, max_guests, daily_capacity, combo_parts, sort_order)
values
  -- SAUNA + IJSBAAN
  ('sauna30','sauna','Sauna 30 min','Sauna 30 min','Korte sauna sessie.','Quick sauna session.',30,1900,false,7,40,'{}',10),
  ('sauna60','sauna','Sauna 60 min','Sauna 60 min','De zoete plek voor sauna.','The sweet spot for sauna.',60,2700,false,7,40,'{}',20),
  ('sauna90','sauna','Sauna 90 min','Sauna 90 min','Lange ontspanning.','Long, deep relaxation.',90,3500,false,7,40,'{}',30),
  ('ijsbad','sauna','IJsbad','Ice bath','Tien minuten in koud water.','Ten minutes in cold water.',10,1200,false,7,30,'{}',40),

  -- PRIVÉ
  ('privedate2','prive','Privé Date (2 personen)','Private Date (2 guests)','Privé sauna + ijsbad voor twee.','Private sauna + ice bath for two.',60,8995,true,2,8,'{}',100),
  ('privedate46','prive','Privé Date (4-6 personen)','Private Date (4-6 guests)','Privé sauna + ijsbad voor groep.','Private sauna + ice bath for group.',60,8995,true,6,4,'{}',110),

  -- MASSAGES
  ('buccal','massage','Buccal Massage 30 min','Buccal Massage 30 min','Mond- en gezichtsmassage.','Mouth + face massage.',30,5000,false,1,12,'{}',200),
  ('relax30','massage','Relax Massage 30 min','Relax Massage 30 min','Klassieke ontspanningsmassage.','Classic relaxation massage.',30,5000,false,1,12,'{}',210),
  ('deep30','massage','Deep Tissue 30 min','Deep Tissue 30 min','Intensieve diepe massage.','Deep tissue, intense pressure.',30,5000,false,1,12,'{}',220),
  ('relax60','massage','Relax Massage 60 min','Relax Massage 60 min','Volle uur ontspanning.','A full hour of relaxation.',60,8500,false,1,12,'{}',230),
  ('deep60','massage','Deep Tissue 60 min','Deep Tissue 60 min','Volle uur deep tissue.','A full hour of deep tissue.',60,8500,false,1,12,'{}',240),
  ('relax90','massage','Relax Massage 90 min','Relax Massage 90 min','90 minuten ontspanning.','90 minutes of relaxation.',90,11000,false,1,12,'{}',250),
  ('deep90','massage','Deep Tissue 90 min','Deep Tissue 90 min','90 minuten deep tissue.','90 minutes of deep tissue.',90,11000,false,1,12,'{}',260),
  ('cupping','massage','Cupping 30 min','Cupping 30 min','Cupping therapie.','Cupping therapy.',30,5000,false,1,12,'{}',270),

  -- COMBI
  ('combi30relax','combi','30min Wellness + Relax Massage','30min Wellness + Relax Massage','Wellness + relax in één.','Wellness + relax bundled.',60,6900,false,1,8,array['30min wellness','30min relax massage'],300),
  ('combi30deep','combi','30min Wellness + Deep Tissue','30min Wellness + Deep Tissue','Wellness + deep tissue in één.','Wellness + deep tissue bundled.',60,6900,false,1,8,array['30min wellness','30min deep tissue massage'],310),
  ('combi60relax','combi','60min Wellness + Relax Massage','60min Wellness + Relax Massage','Lange wellness + relax massage.','Long wellness + relax massage.',120,10400,false,1,8,array['60min wellness','60min relax massage'],320),
  ('combi60deep','combi','60min Wellness + Deep Tissue','60min Wellness + Deep Tissue','Lange wellness + deep tissue.','Long wellness + deep tissue.',120,10400,false,1,8,array['60min wellness','60min deep tissue massage'],330),
  ('combi30relax60','combi','30min Wellness + 60min Relax','30min Wellness + 60min Relax','Wellness + uur relax.','Wellness + hour of relax.',90,8900,false,1,8,array['30min wellness','60min relax massage'],340),
  ('combi30deep60','combi','30min Wellness + 60min Deep','30min Wellness + 60min Deep','Wellness + uur deep tissue.','Wellness + hour of deep tissue.',90,8900,false,1,8,array['30min wellness','60min deep tissue massage'],350),
  ('combi60relax30','combi','60min Wellness + 30min Relax','60min Wellness + 30min Relax','Uur wellness + relax.','Hour of wellness + relax.',90,8900,false,1,8,array['60min wellness','30min relax massage'],360),
  ('combi60deep30','combi','60min Wellness + 30min Deep','60min Wellness + 30min Deep','Uur wellness + deep tissue.','Hour of wellness + deep tissue.',90,8900,false,1,8,array['60min wellness','30min deep tissue massage'],370),
  ('combi30buccal','combi','30min Wellness + Buccal','30min Wellness + Buccal','Wellness + buccal.','Wellness + buccal.',60,6900,false,1,8,array['30min wellness','30min buccal massage'],380),

  -- MEN
  ('menbeard','men','Baard / Beard Care','Beard Care','Baardverzorging.','Beard grooming.',35,7500,false,1,8,'{}',400),
  ('menhair','men','Heren Knippen','Men''s Haircut','Knippen voor heren.','Men''s haircut.',45,8500,false,1,8,'{}',410),
  ('menfull','men','Full Service Heren','Full Service Men','Haar + baard + verzorging.','Hair + beard + treatment.',60,11000,false,1,8,'{}',420),

  -- STUDIO
  ('studio1','studio','Studio Booking 1 uur','Studio Booking 1 hour','Studio voor 1 uur.','Studio for 1 hour.',60,9500,true,10,4,'{}',500),
  ('studio2','studio','Studio Booking 2 uur','Studio Booking 2 hours','Studio voor 2 uur.','Studio for 2 hours.',120,17500,true,10,4,'{}',510),
  ('studio3','studio','Studio Booking 3 uur','Studio Booking 3 hours','Studio voor 3 uur.','Studio for 3 hours.',180,24500,true,10,4,'{}',520),
  ('studio4','studio','Studio Booking 4 uur','Studio Booking 4 hours','Studio voor 4 uur.','Studio for 4 hours.',240,31000,true,10,4,'{}',530),
  ('studio5','studio','Studio Booking Dag','Studio Booking Day','Studio voor een hele dag.','Studio for a full day.',480,55000,true,10,2,'{}',540)
on conflict (id) do update set
  category = excluded.category,
  name_nl  = excluded.name_nl,
  name_en  = excluded.name_en,
  desc_nl  = excluded.desc_nl,
  desc_en  = excluded.desc_en,
  duration_min = excluded.duration_min,
  price_cents  = excluded.price_cents,
  requires_guests = excluded.requires_guests,
  max_guests   = excluded.max_guests,
  daily_capacity = excluded.daily_capacity,
  combo_parts  = excluded.combo_parts,
  sort_order   = excluded.sort_order,
  active       = true,
  updated_at   = now();

insert into addons (id, name_nl, name_en, desc_nl, desc_en, price_cents, service_ids, sort_order) values
  ('tea',   'LUCA Thee',          'LUCA Tea',          'Verse kruidenthee.',     'Fresh herbal tea.',          1200, array['sauna30','sauna60','sauna90','privedate2','privedate46','relax30','deep30','relax60','deep60','relax90','deep90','cupping','buccal','combi30relax','combi30deep','combi60relax','combi60deep','combi30relax60','combi30deep60','combi60relax30','combi60deep30','combi30buccal','ijsbad','menbeard','menhair','menfull'], 10),
  ('juice', 'Koudgeperste Sap',   'Cold-Pressed Juice','Verse koudgeperste sap.', 'Fresh cold-pressed juice.',  1400, array['sauna30','sauna60','sauna90','privedate2','privedate46','relax30','deep30','relax60','deep60','relax90','deep90','cupping','buccal','combi30relax','combi30deep','combi60relax','combi60deep','combi30relax60','combi30deep60','combi60relax30','combi60deep30','combi30buccal','ijsbad','menbeard','menhair','menfull'], 20),
  ('robe',  'Badjas + Slippers',  'Robe + Slippers',   'Verse badjas en slippers.','Fresh robe and slippers.',  1800, array['sauna30','sauna60','sauna90','privedate2','privedate46','relax30','deep30','relax60','deep60','relax90','deep90','cupping','buccal','combi30relax','combi30deep','combi60relax','combi60deep','combi30relax60','combi30deep60','combi60relax30','combi60deep30','combi30buccal','ijsbad','menbeard','menhair','menfull'], 30)
on conflict (id) do update set
  name_nl = excluded.name_nl,
  name_en = excluded.name_en,
  desc_nl = excluded.desc_nl,
  desc_en = excluded.desc_en,
  price_cents = excluded.price_cents,
  service_ids = excluded.service_ids,
  active = true;
