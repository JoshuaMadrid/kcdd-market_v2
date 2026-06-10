-- Seed data for kcdd-market_v2

-- Insert initial cause areas
INSERT INTO cause_areas (name, description) VALUES
  ('Education', 'Educational technology and resources'),
  ('Health & Wellness', 'Health and wellness technology'),
  ('Economic Development', 'Economic development and workforce technology'),
  ('Community Services', 'Community service and support technology'),
  ('Youth Development', 'Youth development and mentorship technology'),
  ('Arts & Culture', 'Arts, culture, and creativity technology'),
  ('Environment', 'Environmental and sustainability technology'),
  ('Housing', 'Housing and shelter technology');

-- Insert challenge categories
INSERT INTO challenge_categories (name) VALUES
  ('Digital Divide'),
  ('Workforce Development'),
  ('Education Access'),
  ('Healthcare Access'),
  ('Financial Inclusion'),
  ('Community Engagement'),
  ('Environmental Justice'),
  ('Food Security');

-- Insert identity categories  
INSERT INTO identity_categories (name) VALUES
  ('Black/African American'),
  ('Hispanic/Latinx'),
  ('Asian American'),
  ('Native American'),
  ('LGBTQ+'),
  ('Women'),
  ('Veterans'),
  ('Disability'),
  ('Youth'),
  ('Seniors');

-- Create test admin user (password: admin123)
-- You'll need to create this through the Supabase UI or Auth API

-- ============================================================
-- MOCK DATA BLOCK (campaigns-only flow)
-- ============================================================
-- Mock IDs use UUID-shaped strings so they slot into TEXT columns
-- (user_profiles.id, organizations.user_id, campaigns.created_by are TEXT
-- after migration 20260518000000_clerk_user_id_text.sql).
-- Inserts are idempotent via ON CONFLICT so re-running db:reset is safe.
-- requests / fulfillment / payment_transactions intentionally omitted —
-- this branch exercises the campaign donation flow only.

-- STEP M1: user_profiles (3 CBO owners + 3 mock donors)
INSERT INTO user_profiles (id, user_type, is_vetted, email, name) VALUES
  ('00000000-0000-0000-0002-000000000001', 'cbo',   true,  'amara@connectingroots.org',   'Amara Johnson'),
  ('00000000-0000-0000-0002-000000000002', 'cbo',   true,  'lin@kctechbridge.org',        'Lin Chen'),
  ('00000000-0000-0000-0002-000000000003', 'cbo',   true,  'devon@digitalfutureskc.org',  'Devon Park'),
  ('00000000-0000-0000-0003-000000000001', 'donor', false, 'donor1@example.com',          'Marcus Tanner'),
  ('00000000-0000-0000-0003-000000000002', 'donor', false, 'donor2@example.com',          'Priya Sharma'),
  ('00000000-0000-0000-0003-000000000003', 'donor', false, 'donor3@example.com',          'James Wallace')
ON CONFLICT (id) DO NOTHING;

-- STEP M2: organizations (3 CBOs)
INSERT INTO organizations (
  id, user_id, name, mission, email, phone, zipcode,
  logo_emoji, tagline, organization_type, year_founded, website,
  program_description, service_area_description
) VALUES
  (
    '00000000-0000-0000-0004-000000000001',
    '00000000-0000-0000-0002-000000000001',
    'Connecting Roots KC',
    'Connecting Roots KC bridges the digital divide for youth in Kansas City''s most underserved neighborhoods. We provide refurbished technology, digital literacy training, and mentorship to help young people thrive in the 21st-century economy.',
    'info@connectingroots.org',
    '(816) 555-0101',
    '64130',
    '🌱',
    'Growing digital equity, one youth at a time.',
    'Nonprofit 501(c)(3)',
    2017,
    'https://connectingroots.org',
    'Our flagship Digital Seedlings program serves 200+ youth annually across three KC school districts.',
    'Jackson County, Missouri — primarily ZIP codes 64130, 64128, and 64132.'
  ),
  (
    '00000000-0000-0000-0004-000000000002',
    '00000000-0000-0000-0002-000000000002',
    'KC Tech Bridge',
    'KC Tech Bridge empowers immigrant and refugee communities in the Kansas City metro with the digital tools and skills needed for workforce participation and economic self-sufficiency.',
    'hello@kctechbridge.org',
    '(816) 555-0202',
    '64111',
    '🌉',
    'Connecting communities to opportunity through technology.',
    'Nonprofit 501(c)(3)',
    2019,
    'https://kctechbridge.org',
    'Our WorkReady program pairs each participant with a refurbished laptop and 12 weeks of job-ready digital skills training.',
    'Wyandotte County, KS and Jackson County, MO — ZIP codes 64111, 64112, 66101, 66102.'
  ),
  (
    '00000000-0000-0000-0004-000000000003',
    '00000000-0000-0000-0002-000000000003',
    'Digital Futures KC',
    'Digital Futures KC delivers technology access and telehealth support to seniors and people with disabilities across the Kansas City metro.',
    'contact@digitalfutureskc.org',
    '(816) 555-0303',
    '64106',
    '💻',
    'Technology for every stage of life.',
    'Nonprofit 501(c)(3)',
    2015,
    'https://digitalfutureskc.org',
    'Our Silver Screens program equips seniors with tablets and one-on-one digital coaching.',
    'Greater Kansas City metro — ZIP codes 64106, 64108, 64110, 64113, 64114.'
  )
ON CONFLICT (id) DO NOTHING;

-- STEP M3: donor_profiles (3 mock donors)
INSERT INTO donor_profiles (
  id, user_id, display_name, name, email, max_per_request, bio, service_area_zipcode
) VALUES
  (
    '00000000-0000-0000-0005-000000000001',
    '00000000-0000-0000-0003-000000000001',
    'Marcus T.',
    'Marcus Tanner',
    'donor1@example.com',
    750.00,
    'KC-area tech professional passionate about closing the digital divide.',
    '64113'
  ),
  (
    '00000000-0000-0000-0005-000000000002',
    '00000000-0000-0000-0003-000000000002',
    'Priya S.',
    'Priya Sharma',
    'donor2@example.com',
    500.00,
    'Software engineer and community advocate.',
    '64111'
  ),
  (
    '00000000-0000-0000-0005-000000000003',
    '00000000-0000-0000-0003-000000000003',
    'James W.',
    'James Wallace',
    'donor3@example.com',
    1200.00,
    'Retired IT director giving back to KC nonprofits.',
    '64106'
  )
ON CONFLICT (id) DO NOTHING;

-- STEP M4: mark orgs as Stripe-Connect-ready so the donate modal does not
-- gate behind "Payments Not Available" in local dev. `acct_test_*` IDs are
-- placeholders that never actually charge; combined with STRIPE_BYPASS_CONNECT=true
-- in backend/.env they let the campaign donate flow render end-to-end.
UPDATE organizations SET
  stripe_account_id = 'acct_test_connecting_roots',
  stripe_charges_enabled = true,
  stripe_onboarding_complete = true,
  stripe_details_submitted = true
WHERE id = '00000000-0000-0000-0004-000000000001';

UPDATE organizations SET
  stripe_account_id = 'acct_test_kc_tech_bridge',
  stripe_charges_enabled = true,
  stripe_onboarding_complete = true,
  stripe_details_submitted = true
WHERE id = '00000000-0000-0000-0004-000000000002';

UPDATE organizations SET
  stripe_account_id = 'acct_test_digital_futures',
  stripe_charges_enabled = true,
  stripe_onboarding_complete = true,
  stripe_details_submitted = true
WHERE id = '00000000-0000-0000-0004-000000000003';

-- STEP M5: campaigns (6 active + 1 pending, spread across the 3 CBOs)
INSERT INTO campaigns (
  id, organization_id, created_by, title, slug, creator_name, creator_role,
  funding_goal, amount_raised, supporters_count,
  short_description, story_title, story_content,
  contact_email, phone, image_url, logo_url,
  facebook_url, instagram_url, status
) VALUES
  ('00000000-0000-0000-0009-000000000001', '00000000-0000-0000-0004-000000000001',
   '00000000-0000-0000-0002-000000000001',
   'Laptops for the Roots After-School Program',
   'laptops-for-roots-afterschool',
   'Amara Johnson', 'Program Director',
   12000.00, 7350.00, 47,
   'Help us put 25 refurbished laptops into the hands of middle-schoolers in our weekday after-school cohort.',
   'Why this matters',
   '<h2>Why this matters</h2><p>Last semester, 18 of our 25 enrolled students had to share a single shelf of Chromebooks. Homework went home unfinished, and our retention dropped from 82% to 64% in the spring.</p><p>With <strong>$12,000</strong> we can buy 25 refurbished Lenovo ThinkPads, accessory bundles, and a year of break/fix support.</p>',
   'campaigns@connectingroots.org', '+1-816-555-0111',
   'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&q=80',
   'https://example.com/img/connecting-roots-logo.png',
   'https://facebook.com/connectingrootskc', 'https://instagram.com/connectingrootskc',
   'active'),
  ('00000000-0000-0000-0009-000000000002', '00000000-0000-0000-0004-000000000003',
   '00000000-0000-0000-0002-000000000003',
   'Digital Futures Mobile Lab',
   'digital-futures-mobile-lab',
   'Devon Park', 'Executive Director',
   45000.00, 18900.00, 121,
   'A retrofitted van + 15 workstations brings basic computer skills to underserved Northland neighborhoods.',
   'A classroom on wheels',
   '<h2>A classroom on wheels</h2><p>Our fixed-site classes have a 4-month waitlist while seniors in the Northland tell us they cannot reach our downtown office. This mobile lab — a 2018 Ford Transit retrofitted with 15 laptop stations and Starlink uplink — will bring 6 weekly classes to 4 community centers north of the river.</p>',
   'campaigns@digitalfutureskc.org', '+1-816-555-0133',
   'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1200&q=80',
   'https://example.com/img/digital-futures-logo.png',
   NULL, 'https://instagram.com/digitalfutureskc',
   'active'),
  ('00000000-0000-0000-0009-000000000003', '00000000-0000-0000-0004-000000000002',
   '00000000-0000-0000-0002-000000000002',
   'Tech Bridge Senior Cohort (Spring 2026)',
   'tech-bridge-senior-cohort-spring-2026',
   'Lin Chen', 'Programs Lead',
   8500.00, 0.00, 0,
   'Funding 30 tablets + accessibility kits for our spring cohort serving adults 65+.',
   'Reaching the last mile',
   '<p>Our spring cohort opens in February. Hardware lead time means we need committed funding by January 15.</p>',
   'campaigns@kctechbridge.org', '+1-816-555-0122',
   NULL, NULL, NULL, NULL,
   'pending'),
  ('00000000-0000-0000-0009-000000000004', '00000000-0000-0000-0004-000000000002',
   '00000000-0000-0000-0002-000000000002',
   'Workforce Computer Lab — Tech Bridge',
   'workforce-computer-lab-tech-bridge',
   'Lin Chen', 'Programs Lead',
   18000.00, 4250.00, 19,
   'Outfit a 12-station job-readiness lab for adults transitioning out of shelters and re-entry programs.',
   'A doorway to a paycheck',
   '<p>Our partners refer 80–90 adults a year who need entry-level digital skills. We currently rent lab time at the library — limited to 2 hours per week. A dedicated 12-station lab unlocks evening and weekend training.</p>',
   'campaigns@kctechbridge.org', '+1-816-555-0122',
   'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80',
   NULL, NULL, NULL,
   'active'),
  ('00000000-0000-0000-0009-000000000005', '00000000-0000-0000-0004-000000000001',
   '00000000-0000-0000-0002-000000000001',
   'Arts Studio Tablets for Roots Teens',
   'arts-studio-tablets-roots-teens',
   'Amara Johnson', 'Program Director',
   5000.00, 4200.00, 38,
   '10 iPad + Apple Pencil bundles for our Saturday teen arts studio.',
   'Where pencils meet pixels',
   '<p>Our Saturday teens have been making zines for 3 years. Half now ask about digital art and beat production. Hardware is the only thing standing between them and a portfolio they can take to art school.</p>',
   'campaigns@connectingroots.org', '+1-816-555-0111',
   'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=1200&q=80',
   NULL,
   'https://facebook.com/connectingrootskc', NULL,
   'active'),
  ('00000000-0000-0000-0009-000000000006', '00000000-0000-0000-0004-000000000003',
   '00000000-0000-0000-0002-000000000003',
   'Stay-Connected Phones for Housing Stability',
   'stay-connected-phones-housing-stability',
   'Devon Park', 'Executive Director',
   6500.00, 6500.00, 73,
   '50 prepaid smartphones + 6-month service for clients transitioning out of shelter into permanent housing.',
   'A working phone IS housing stability',
   '<p>Caseworkers report 3 in 10 housing placements fail in the first 90 days because clients cannot be reached for utility setup, employer call-backs, or appointments. A phone changes that.</p>',
   'campaigns@digitalfutureskc.org', '+1-816-555-0133',
   'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1200&q=80',
   NULL, NULL, 'https://instagram.com/digitalfutureskc',
   'active'),
  ('00000000-0000-0000-0009-000000000007', '00000000-0000-0000-0004-000000000001',
   '00000000-0000-0000-0002-000000000001',
   'Health-Tech Kiosk at the Roots Community Hub',
   'health-tech-kiosk-roots-community-hub',
   'Amara Johnson', 'Program Director',
   9200.00, 1850.00, 12,
   'A telehealth kiosk + Bluetooth BP cuff station in our lobby — open to neighbors during business hours.',
   'Closing the last appointment-mile',
   '<p>Our community hub already hosts 200+ visits per month. A self-serve telehealth booth lets neighbors talk to a nurse without a doctor visit.</p>',
   'campaigns@connectingroots.org', '+1-816-555-0111',
   NULL,
   'https://example.com/img/connecting-roots-logo.png',
   NULL, NULL,
   'active')
ON CONFLICT (id) DO NOTHING;

COMMIT;

