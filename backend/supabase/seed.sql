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
  ('Housing', 'Housing and shelter technology')
ON CONFLICT (name) DO NOTHING;

-- Insert challenge categories
INSERT INTO challenge_categories (name) VALUES
  ('Digital Divide'),
  ('Workforce Development'),
  ('Education Access'),
  ('Healthcare Access'),
  ('Financial Inclusion'),
  ('Community Engagement'),
  ('Environmental Justice'),
  ('Food Security')
ON CONFLICT (name) DO NOTHING;

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
  ('Seniors')
ON CONFLICT (name) DO NOTHING;

-- Create test admin user (password: admin123)
-- You'll need to create this through the Supabase UI or Auth API

-- ============================================================
-- MOCK DATA BLOCK
-- ============================================================

-- STEP 1: Insert user_profiles directly
-- After migration 20260518000000_clerk_user_id_text.sql, user_profiles.id is TEXT
-- and no longer FK-bound to auth.users. We can insert mock profiles directly.
-- IDs keep their UUID-shaped format to preserve FK target values throughout the seed,
-- but they're stored as TEXT (so real Clerk IDs like "user_xxx" also work post-migration).
-- The escalation trigger is bypassed by inserting (not updating) — trigger only fires on UPDATE.
INSERT INTO user_profiles (id, user_type, is_vetted) VALUES
  ('00000000-0000-0000-0001-000000000001', 'admin', true),
  ('00000000-0000-0000-0002-000000000001', 'cbo',   true),
  ('00000000-0000-0000-0002-000000000002', 'cbo',   true),
  ('00000000-0000-0000-0002-000000000003', 'cbo',   true),
  ('00000000-0000-0000-0003-000000000001', 'donor', false),
  ('00000000-0000-0000-0003-000000000002', 'donor', false),
  ('00000000-0000-0000-0003-000000000003', 'donor', false),
  -- Real Clerk users pre-seeded with their roles (survives db:reset; /api/users/sync respects existing row via ignoreDuplicates)
  ('user_3DnElkT9WrqI1pJ5SBKNfoZB73x',     'admin', true),
  ('user_3DsXr8YQSQrpyJsmOVTqWaa48qy',     'cbo',   true)
ON CONFLICT (id) DO NOTHING;

-- STEP 5: Insert organizations (3 rows)
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
    'Our flagship Digital Seedlings program serves 200+ youth annually across three KC school districts. We offer after-school coding clubs, summer tech camps, and a device lending library.',
    'Jackson County, Missouri — primarily ZIP codes 64130, 64128, and 64132.'
  ),
  (
    '00000000-0000-0000-0004-000000000002',
    '00000000-0000-0000-0002-000000000002',
    'KC Tech Bridge',
    'KC Tech Bridge empowers immigrant and refugee communities in the Kansas City metro with the digital tools and skills needed for workforce participation and economic self-sufficiency. We partner with local employers to create technology pipelines that lead to living-wage jobs.',
    'hello@kctechbridge.org',
    '(816) 555-0202',
    '64111',
    '🌉',
    'Connecting communities to opportunity through technology.',
    'Nonprofit 501(c)(3)',
    2019,
    'https://kctechbridge.org',
    'Our WorkReady program pairs each participant with a refurbished laptop and 12 weeks of job-ready digital skills training. Graduates have an 80% employment rate within 90 days.',
    'Wyandotte County, KS and Jackson County, MO — ZIP codes 64111, 64112, 66101, 66102.'
  ),
  (
    '00000000-0000-0000-0004-000000000003',
    '00000000-0000-0000-0002-000000000003',
    'Digital Futures KC',
    'Digital Futures KC delivers technology access and telehealth support to seniors and people with disabilities across the Kansas City metro. We believe every person deserves the dignity of digital participation regardless of age or ability.',
    'contact@digitalfutureskc.org',
    '(816) 555-0303',
    '64106',
    '💻',
    'Technology for every stage of life.',
    'Nonprofit 501(c)(3)',
    2015,
    'https://digitalfutureskc.org',
    'Our Silver Screens program equips seniors with tablets and one-on-one digital coaching. Our AccessAbility initiative provides adaptive technology assessments and device matching for community members with disabilities.',
    'Greater Kansas City metro — ZIP codes 64106, 64108, 64110, 64113, 64114.'
  )
ON CONFLICT (id) DO NOTHING;

-- STEP 6: Insert donor_profiles (3 rows)
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
    'KC-area tech professional passionate about closing the digital divide for the next generation.',
    '64113'
  ),
  (
    '00000000-0000-0000-0005-000000000002',
    '00000000-0000-0000-0003-000000000002',
    'Priya S.',
    'Priya Sharma',
    'donor2@example.com',
    500.00,
    'Software engineer and community advocate who believes technology access is a basic right.',
    '64111'
  ),
  (
    '00000000-0000-0000-0005-000000000003',
    '00000000-0000-0000-0003-000000000003',
    'James W.',
    'James Wallace',
    'donor3@example.com',
    1200.00,
    'Retired IT director giving back by helping nonprofits get the equipment they need to serve KC.',
    '64106'
  )
ON CONFLICT (id) DO NOTHING;

-- STEP 7: organization_cause_areas (6 rows)
INSERT INTO organization_cause_areas (organization_id, cause_area_id)
VALUES
  ('00000000-0000-0000-0004-000000000001', (SELECT id FROM cause_areas WHERE name = 'Education')),
  ('00000000-0000-0000-0004-000000000001', (SELECT id FROM cause_areas WHERE name = 'Youth Development')),
  ('00000000-0000-0000-0004-000000000002', (SELECT id FROM cause_areas WHERE name = 'Economic Development')),
  ('00000000-0000-0000-0004-000000000002', (SELECT id FROM cause_areas WHERE name = 'Community Services')),
  ('00000000-0000-0000-0004-000000000003', (SELECT id FROM cause_areas WHERE name = 'Health & Wellness')),
  ('00000000-0000-0000-0004-000000000003', (SELECT id FROM cause_areas WHERE name = 'Education'))
ON CONFLICT (organization_id, cause_area_id) DO NOTHING;

-- STEP 8: organization_populations (6 rows)
INSERT INTO organization_populations (organization_id, identity_category_id)
VALUES
  ('00000000-0000-0000-0004-000000000001', (SELECT id FROM identity_categories WHERE name = 'Black/African American')),
  ('00000000-0000-0000-0004-000000000001', (SELECT id FROM identity_categories WHERE name = 'Youth')),
  ('00000000-0000-0000-0004-000000000002', (SELECT id FROM identity_categories WHERE name = 'Hispanic/Latinx')),
  ('00000000-0000-0000-0004-000000000002', (SELECT id FROM identity_categories WHERE name = 'Veterans')),
  ('00000000-0000-0000-0004-000000000003', (SELECT id FROM identity_categories WHERE name = 'Seniors')),
  ('00000000-0000-0000-0004-000000000003', (SELECT id FROM identity_categories WHERE name = 'Disability'))
ON CONFLICT (organization_id, identity_category_id) DO NOTHING;

-- STEP 9: organization_updates (6 rows)
INSERT INTO organization_updates (id, organization_id, title, content, is_published)
VALUES
  (
    '00000000-0000-0000-0010-000000000001',
    '00000000-0000-0000-0004-000000000001',
    'Summer Tech Camp Registration Now Open',
    'We''re excited to announce that registration for our 2026 Summer Tech Camp is officially open. This year we''ll serve 80 youth across two sessions in July and August, covering web design, app basics, and digital citizenship. Spots are limited — encourage your neighbors to apply today.',
    true
  ),
  (
    '00000000-0000-0000-0010-000000000002',
    '00000000-0000-0000-0004-000000000001',
    'Thank You to Our Spring Device Drive Donors',
    'Thanks to the generosity of 14 individual donors through KC Digital Drive Market, we distributed 22 refurbished laptops to families in the 64130 zip code this spring. Every device means a child can do homework, a parent can apply for jobs, and a family stays connected.',
    true
  ),
  (
    '00000000-0000-0000-0010-000000000003',
    '00000000-0000-0000-0004-000000000002',
    'WorkReady Cohort 7 Graduates 18 Participants',
    'Cohort 7 of our WorkReady digital skills program graduated last month with 18 participants completing the full 12-week curriculum. Twelve graduates have already accepted employment offers with local KC employers. We''re proud of every one of them.',
    true
  ),
  (
    '00000000-0000-0000-0010-000000000004',
    '00000000-0000-0000-0004-000000000002',
    'New Partnership with KC Public Library',
    'KC Tech Bridge is thrilled to announce a new referral partnership with the Kansas City Public Library system. Library staff will now refer newly arrived immigrants and refugees directly to our WorkReady intake process, streamlining the path from arrival to employment.',
    true
  ),
  (
    '00000000-0000-0000-0010-000000000005',
    '00000000-0000-0000-0004-000000000003',
    'AccessAbility Program Expands to Clay County',
    'Digital Futures KC has received funding to expand our AccessAbility adaptive technology program into Clay County, Missouri. We''ll begin intake assessments for residents with disabilities in the 64116 and 64118 zip codes starting next month.',
    true
  ),
  (
    '00000000-0000-0000-0010-000000000006',
    '00000000-0000-0000-0004-000000000003',
    'Silver Screens Celebrates 500th Senior Served',
    'This month we reached a major milestone: 500 Kansas City seniors have now completed our Silver Screens digital coaching program since 2015. Our oldest graduate, age 91, now video calls her grandchildren weekly and manages her medical appointments online entirely on her own.',
    true
  )
ON CONFLICT (id) DO NOTHING;

-- STEP 10: organization_team_members (9 rows)
INSERT INTO organization_team_members (id, organization_id, name, role, bio, display_order, is_active)
VALUES
  (
    '00000000-0000-0000-0011-000000000001',
    '00000000-0000-0000-0004-000000000001',
    'Denise Holloway',
    'Executive Director',
    'Denise has led Connecting Roots KC since its founding and brings 15 years of youth development experience in the Kansas City nonprofit sector.',
    1, true
  ),
  (
    '00000000-0000-0000-0011-000000000002',
    '00000000-0000-0000-0004-000000000001',
    'Tyrell Banks',
    'Director of Technology Programs',
    'Tyrell oversees the Digital Seedlings curriculum and manages relationships with school district partners across Jackson County.',
    2, true
  ),
  (
    '00000000-0000-0000-0011-000000000003',
    '00000000-0000-0000-0004-000000000001',
    'Amara Osei',
    'Community Outreach Coordinator',
    'Amara connects families in the 64130 and 64128 corridors with our device lending library and after-school coding clubs.',
    3, true
  ),
  (
    '00000000-0000-0000-0011-000000000004',
    '00000000-0000-0000-0004-000000000002',
    'Rosa Guerrero',
    'Executive Director',
    'Rosa founded KC Tech Bridge after her own experience as a newcomer to Kansas City and has grown the organization from a volunteer project to a staff of eight.',
    1, true
  ),
  (
    '00000000-0000-0000-0011-000000000005',
    '00000000-0000-0000-0004-000000000002',
    'Ahmad Karimi',
    'Workforce Training Manager',
    'Ahmad designs the WorkReady curriculum and coordinates with employer partners to ensure graduates have job-ready digital skills.',
    2, true
  ),
  (
    '00000000-0000-0000-0011-000000000006',
    '00000000-0000-0000-0004-000000000002',
    'Leticia Vega',
    'Intake & Case Coordinator',
    'Leticia manages participant intake, tracks outcomes, and ensures every WorkReady cohort member has the wraparound support they need to complete the program.',
    3, true
  ),
  (
    '00000000-0000-0000-0011-000000000007',
    '00000000-0000-0000-0004-000000000003',
    'Carl Hutchinson',
    'Executive Director',
    'Carl brings 20 years of experience in disability services and has steered Digital Futures KC from a small pilot to one of the region''s leading digital inclusion organizations.',
    1, true
  ),
  (
    '00000000-0000-0000-0011-000000000008',
    '00000000-0000-0000-0004-000000000003',
    'Mei-Ling Park',
    'Senior Services Program Lead',
    'Mei-Ling runs the Silver Screens coaching program and trains the volunteer corps of 40+ digital coaches who serve seniors across the metro.',
    2, true
  ),
  (
    '00000000-0000-0000-0011-000000000009',
    '00000000-0000-0000-0004-000000000003',
    'Darius Coleman',
    'AccessAbility Specialist',
    'Darius conducts adaptive technology assessments and matches participants with disabilities to the devices and software that best fit their needs.',
    3, true
  )
ON CONFLICT (id) DO NOTHING;

-- STEP 11: requests (28 rows: 12 open, 5 claimed, 6 fulfilled, 5 denied)
INSERT INTO requests (
  id, organization_id, cause_area_id, donor_id, description, amount,
  urgency, zipcode, status, payment_intent_id, claimed_at, fulfilled_at, denied_at, denial_reason
) VALUES
  -- 6 OPEN
  (
    '00000000-0000-0000-0006-000000000001',
    '00000000-0000-0000-0004-000000000001',
    (SELECT id FROM cause_areas WHERE name = 'Education'),
    NULL,
    '15 refurbished Chromebooks for our Digital Seedlings after-school program. Students in the 64130 corridor have no devices at home and cannot complete homework without them.',
    450.00, 'high', '64130', 'open', NULL, NULL, NULL, NULL, NULL
  ),
  (
    '00000000-0000-0000-0006-000000000002',
    '00000000-0000-0000-0004-000000000001',
    (SELECT id FROM cause_areas WHERE name = 'Youth Development'),
    NULL,
    'Wireless router and network switch to upgrade the community room in our partner building on Prospect Ave. Our current equipment drops connections mid-session.',
    185.00, 'medium', '64130', 'open', NULL, NULL, NULL, NULL, NULL
  ),
  (
    '00000000-0000-0000-0006-000000000003',
    '00000000-0000-0000-0004-000000000002',
    (SELECT id FROM cause_areas WHERE name = 'Economic Development'),
    NULL,
    '10 laptop charging stations for our WorkReady training lab. Participants bring their own devices but we have no charging infrastructure, which disrupts every class session.',
    320.00, 'high', '64111', 'open', NULL, NULL, NULL, NULL, NULL
  ),
  (
    '00000000-0000-0000-0006-000000000004',
    '00000000-0000-0000-0004-000000000002',
    (SELECT id FROM cause_areas WHERE name = 'Community Services'),
    NULL,
    'Projector and HDMI cables for our weekly community digital literacy workshops. We currently borrow a projector from a neighboring office, which is unreliable.',
    275.00, 'medium', '64111', 'open', NULL, NULL, NULL, NULL, NULL
  ),
  (
    '00000000-0000-0000-0006-000000000005',
    '00000000-0000-0000-0004-000000000003',
    (SELECT id FROM cause_areas WHERE name = 'Health & Wellness'),
    NULL,
    '8 large-screen tablets pre-configured for telehealth video calls for seniors in our Silver Screens program. Screen size is critical for participants with vision impairment.',
    640.00, 'high', '64106', 'open', NULL, NULL, NULL, NULL, NULL
  ),
  (
    '00000000-0000-0000-0006-000000000006',
    '00000000-0000-0000-0004-000000000003',
    (SELECT id FROM cause_areas WHERE name = 'Education'),
    NULL,
    'Bluetooth keyboard and mouse sets (12 pairs) for participants with limited fine motor control in our AccessAbility program. Standard keyboards cause fatigue and errors.',
    210.00, 'low', '64106', 'open', NULL, NULL, NULL, NULL, NULL
  ),
  -- 3 CLAIMED
  (
    '00000000-0000-0000-0006-000000000007',
    '00000000-0000-0000-0004-000000000001',
    (SELECT id FROM cause_areas WHERE name = 'Youth Development'),
    '00000000-0000-0000-0003-000000000001',
    '2 document scanners for our scholarship application support program. Youth need to digitize transcripts and financial documents that arrive only on paper.',
    380.00, 'high', '64130', 'claimed', 'pi_mock_req07_abc123', NOW() - INTERVAL '2 days', NULL, NULL, NULL
  ),
  (
    '00000000-0000-0000-0006-000000000008',
    '00000000-0000-0000-0004-000000000002',
    (SELECT id FROM cause_areas WHERE name = 'Economic Development'),
    '00000000-0000-0000-0003-000000000002',
    'Standing desk converter for our program coordinator with a back injury. Our current workspace setup causes ongoing pain that is affecting her productivity.',
    165.00, 'medium', '64111', 'claimed', 'pi_mock_req08_def456', NOW() - INTERVAL '3 days', NULL, NULL, NULL
  ),
  (
    '00000000-0000-0000-0006-000000000009',
    '00000000-0000-0000-0004-000000000003',
    (SELECT id FROM cause_areas WHERE name = 'Health & Wellness'),
    '00000000-0000-0000-0003-000000000003',
    'Video doorbell system for our accessibility-adapted training room so that participants who use mobility aids can be admitted without staff having to walk to the door.',
    220.00, 'medium', '64106', 'claimed', 'pi_mock_req09_ghi789', NOW() - INTERVAL '1 day', NULL, NULL, NULL
  ),
  -- 4 FULFILLED
  (
    '00000000-0000-0000-0006-000000000010',
    '00000000-0000-0000-0004-000000000001',
    (SELECT id FROM cause_areas WHERE name = 'Education'),
    '00000000-0000-0000-0003-000000000001',
    '5 refurbished desktop computers for the computer lab at our partner community center on Truman Road. The current machines are over 12 years old and cannot run modern software.',
    750.00, 'high', '64130', 'fulfilled', 'pi_mock_req10_jkl012', NOW() - INTERVAL '14 days', NOW() - INTERVAL '7 days', NULL, NULL
  ),
  (
    '00000000-0000-0000-0006-000000000011',
    '00000000-0000-0000-0004-000000000001',
    (SELECT id FROM cause_areas WHERE name = 'Youth Development'),
    '00000000-0000-0000-0003-000000000002',
    'Noise-canceling headphones (10 pairs) for our coding lab so students can focus during open lab hours.',
    300.00, 'low', '64128', 'fulfilled', 'pi_mock_req11_mno345', NOW() - INTERVAL '20 days', NOW() - INTERVAL '12 days', NULL, NULL
  ),
  (
    '00000000-0000-0000-0006-000000000012',
    '00000000-0000-0000-0004-000000000002',
    (SELECT id FROM cause_areas WHERE name = 'Economic Development'),
    '00000000-0000-0000-0003-000000000003',
    'HP LaserJet printer for our WorkReady intake office. Participants need printed copies of certificates and reference letters for job interviews.',
    420.00, 'medium', '64111', 'fulfilled', 'pi_mock_req12_pqr678', NOW() - INTERVAL '18 days', NOW() - INTERVAL '10 days', NULL, NULL
  ),
  (
    '00000000-0000-0000-0006-000000000013',
    '00000000-0000-0000-0004-000000000003',
    (SELECT id FROM cause_areas WHERE name = 'Health & Wellness'),
    '00000000-0000-0000-0003-000000000001',
    '3 iPad Air tablets for our Silver Screens in-home coaching visits. Coaches currently carry personal devices, which is an insurance and privacy liability.',
    560.00, 'medium', '64106', 'fulfilled', 'pi_mock_req13_stu901', NOW() - INTERVAL '30 days', NOW() - INTERVAL '21 days', NULL, NULL
  ),
  -- 3 DENIED
  (
    '00000000-0000-0000-0006-000000000014',
    '00000000-0000-0000-0004-000000000001',
    (SELECT id FROM cause_areas WHERE name = 'Education'),
    NULL,
    'Industrial label printer for our device inventory system. We track over 100 loaned devices and current paper labels are falling off.',
    195.00, 'low', '64130', 'denied', NULL, NULL, NULL, NOW() - INTERVAL '10 days',
    'Request fell outside current donor interest areas. Recommend resubmitting with updated equipment description aligned to classroom use.'
  ),
  (
    '00000000-0000-0000-0006-000000000015',
    '00000000-0000-0000-0004-000000000002',
    (SELECT id FROM cause_areas WHERE name = 'Economic Development'),
    NULL,
    'Standing lamp for video call backdrop in our intake interview room. Poor lighting makes video interviews look unprofessional for our participants.',
    55.00, 'low', '64111', 'denied', NULL, NULL, NULL, NOW() - INTERVAL '15 days',
    'Amount below platform minimum and item does not qualify as technology equipment under current program guidelines.'
  ),
  (
    '00000000-0000-0000-0006-000000000016',
    '00000000-0000-0000-0004-000000000003',
    (SELECT id FROM cause_areas WHERE name = 'Health & Wellness'),
    NULL,
    'Smart TV for waiting area to display health information for seniors. The screen we currently use has a broken backlight.',
    480.00, 'medium', '64106', 'denied', NULL, NULL, NULL, NOW() - INTERVAL '8 days',
    'Smart TV does not meet the digital access equipment criteria. Suggest requesting a computer monitor or display with HDMI input instead.'
  ),
  -- 6 ADDITIONAL OPEN (total 12 open)
  (
    '00000000-0000-0000-0006-000000000017',
    '00000000-0000-0000-0004-000000000001',
    (SELECT id FROM cause_areas WHERE name = 'Youth Development'),
    NULL,
    '20 USB-C hubs for our after-school coding club. Most school-issued laptops have only one USB-C port and students cannot connect both a mouse and an external drive simultaneously.',
    160.00, 'low', '64128', 'open', NULL, NULL, NULL, NULL, NULL
  ),
  (
    '00000000-0000-0000-0006-000000000018',
    '00000000-0000-0000-0004-000000000001',
    (SELECT id FROM cause_areas WHERE name = 'Education'),
    NULL,
    '4 mobile hotspot devices with 6-month data plans for students whose families cannot afford home internet. Even one missed Wi-Fi week sets students back in our remote-learning track.',
    520.00, 'high', '64132', 'open', NULL, NULL, NULL, NULL, NULL
  ),
  (
    '00000000-0000-0000-0006-000000000019',
    '00000000-0000-0000-0004-000000000002',
    (SELECT id FROM cause_areas WHERE name = 'Economic Development'),
    NULL,
    '6 webcams with built-in ring lights for our remote interview practice sessions. Participants doing job interviews on borrowed laptops often appear in unflattering low light.',
    240.00, 'medium', '66102', 'open', NULL, NULL, NULL, NULL, NULL
  ),
  (
    '00000000-0000-0000-0006-000000000020',
    '00000000-0000-0000-0004-000000000002',
    (SELECT id FROM cause_areas WHERE name = 'Community Services'),
    NULL,
    'Bilingual document scanner with OCR (English/Spanish/Vietnamese) for our immigrant intake services. Manual translation of paper documents adds 2 weeks to each case.',
    430.00, 'high', '64112', 'open', NULL, NULL, NULL, NULL, NULL
  ),
  (
    '00000000-0000-0000-0006-000000000021',
    '00000000-0000-0000-0004-000000000003',
    (SELECT id FROM cause_areas WHERE name = 'Health & Wellness'),
    NULL,
    '5 large-button universal remotes paired with smart speakers for seniors with arthritis or vision impairment. Our pilot showed a 70% increase in independent device use.',
    175.00, 'medium', '64108', 'open', NULL, NULL, NULL, NULL, NULL
  ),
  (
    '00000000-0000-0000-0006-000000000022',
    '00000000-0000-0000-0004-000000000003',
    (SELECT id FROM cause_areas WHERE name = 'Community Services'),
    NULL,
    'Accessibility software licenses (JAWS screen reader, 3 seats) for our AccessAbility computer training lab. Participants with vision impairment cannot currently complete certification courses.',
    1100.00, 'high', '64113', 'open', NULL, NULL, NULL, NULL, NULL
  ),
  -- 2 ADDITIONAL CLAIMED (total 5 claimed)
  (
    '00000000-0000-0000-0006-000000000023',
    '00000000-0000-0000-0004-000000000001',
    (SELECT id FROM cause_areas WHERE name = 'Education'),
    '00000000-0000-0000-0003-000000000002',
    '3 graphing calculators for our high school SAT prep students. Test rules forbid phone calculators and most students do not own a dedicated calculator.',
    285.00, 'medium', '64130', 'claimed', 'pi_mock_req23_vwx234', NOW() - INTERVAL '4 days', NULL, NULL, NULL
  ),
  (
    '00000000-0000-0000-0006-000000000024',
    '00000000-0000-0000-0004-000000000002',
    (SELECT id FROM cause_areas WHERE name = 'Economic Development'),
    '00000000-0000-0000-0003-000000000001',
    '2 portable monitors for our mobile workforce coaching unit. Coaches visiting employer worksites can now do dual-screen resume reviews on-site.',
    340.00, 'low', '66101', 'claimed', 'pi_mock_req24_yza567', NOW() - INTERVAL '6 days', NULL, NULL, NULL
  ),
  -- 2 ADDITIONAL FULFILLED (total 6 fulfilled)
  (
    '00000000-0000-0000-0006-000000000025',
    '00000000-0000-0000-0004-000000000003',
    (SELECT id FROM cause_areas WHERE name = 'Health & Wellness'),
    '00000000-0000-0000-0003-000000000003',
    'Blood pressure cuff with Bluetooth + tablet bundle for telehealth check-ins with homebound seniors. Reduces missed appointments by removing the transportation barrier.',
    410.00, 'high', '64114', 'fulfilled', 'pi_mock_req25_bcd890', NOW() - INTERVAL '25 days', NOW() - INTERVAL '15 days', NULL, NULL
  ),
  (
    '00000000-0000-0000-0006-000000000026',
    '00000000-0000-0000-0004-000000000001',
    (SELECT id FROM cause_areas WHERE name = 'Youth Development'),
    '00000000-0000-0000-0003-000000000002',
    '8 refurbished smartphones for our youth job-readiness program graduates so they can receive employer texts about shifts.',
    640.00, 'medium', '64130', 'fulfilled', 'pi_mock_req26_efg123', NOW() - INTERVAL '40 days', NOW() - INTERVAL '28 days', NULL, NULL
  ),
  -- 2 ADDITIONAL DENIED (total 5 denied)
  (
    '00000000-0000-0000-0006-000000000027',
    '00000000-0000-0000-0004-000000000002',
    (SELECT id FROM cause_areas WHERE name = 'Community Services'),
    NULL,
    'Espresso machine for our welcome center waiting area to provide refreshments while participants wait for intake.',
    780.00, 'low', '64111', 'denied', NULL, NULL, NULL, NOW() - INTERVAL '5 days',
    'Item does not qualify as digital access technology. Coffee equipment is outside the platform''s funding scope.'
  ),
  (
    '00000000-0000-0000-0006-000000000028',
    '00000000-0000-0000-0004-000000000003',
    (SELECT id FROM cause_areas WHERE name = 'Education'),
    NULL,
    'Drone with camera for outdoor accessibility training videos. We want to film walking-route demonstrations for community members.',
    650.00, 'low', '64106', 'denied', NULL, NULL, NULL, NOW() - INTERVAL '12 days',
    'Drone is outside the equipment scope. Recommend resubmitting with a standard handheld camcorder if filming remains a need.'
  )
ON CONFLICT (id) DO NOTHING;

-- STEP 12: request_challenge_categories (16 rows)
INSERT INTO request_challenge_categories (request_id, challenge_category_id)
VALUES
  ('00000000-0000-0000-0006-000000000001', (SELECT id FROM challenge_categories WHERE name = 'Digital Divide')),
  ('00000000-0000-0000-0006-000000000002', (SELECT id FROM challenge_categories WHERE name = 'Education Access')),
  ('00000000-0000-0000-0006-000000000003', (SELECT id FROM challenge_categories WHERE name = 'Workforce Development')),
  ('00000000-0000-0000-0006-000000000004', (SELECT id FROM challenge_categories WHERE name = 'Financial Inclusion')),
  ('00000000-0000-0000-0006-000000000005', (SELECT id FROM challenge_categories WHERE name = 'Healthcare Access')),
  ('00000000-0000-0000-0006-000000000006', (SELECT id FROM challenge_categories WHERE name = 'Community Engagement')),
  ('00000000-0000-0000-0006-000000000007', (SELECT id FROM challenge_categories WHERE name = 'Digital Divide')),
  ('00000000-0000-0000-0006-000000000008', (SELECT id FROM challenge_categories WHERE name = 'Workforce Development')),
  ('00000000-0000-0000-0006-000000000009', (SELECT id FROM challenge_categories WHERE name = 'Healthcare Access')),
  ('00000000-0000-0000-0006-000000000010', (SELECT id FROM challenge_categories WHERE name = 'Education Access')),
  ('00000000-0000-0000-0006-000000000011', (SELECT id FROM challenge_categories WHERE name = 'Digital Divide')),
  ('00000000-0000-0000-0006-000000000012', (SELECT id FROM challenge_categories WHERE name = 'Financial Inclusion')),
  ('00000000-0000-0000-0006-000000000013', (SELECT id FROM challenge_categories WHERE name = 'Healthcare Access')),
  ('00000000-0000-0000-0006-000000000014', (SELECT id FROM challenge_categories WHERE name = 'Education Access')),
  ('00000000-0000-0000-0006-000000000015', (SELECT id FROM challenge_categories WHERE name = 'Workforce Development')),
  ('00000000-0000-0000-0006-000000000016', (SELECT id FROM challenge_categories WHERE name = 'Community Engagement')),
  -- additional requests 17-28
  ('00000000-0000-0000-0006-000000000017', (SELECT id FROM challenge_categories WHERE name = 'Education Access')),
  ('00000000-0000-0000-0006-000000000018', (SELECT id FROM challenge_categories WHERE name = 'Digital Divide')),
  ('00000000-0000-0000-0006-000000000019', (SELECT id FROM challenge_categories WHERE name = 'Workforce Development')),
  ('00000000-0000-0000-0006-000000000020', (SELECT id FROM challenge_categories WHERE name = 'Community Engagement')),
  ('00000000-0000-0000-0006-000000000021', (SELECT id FROM challenge_categories WHERE name = 'Healthcare Access')),
  ('00000000-0000-0000-0006-000000000022', (SELECT id FROM challenge_categories WHERE name = 'Education Access')),
  ('00000000-0000-0000-0006-000000000023', (SELECT id FROM challenge_categories WHERE name = 'Education Access')),
  ('00000000-0000-0000-0006-000000000024', (SELECT id FROM challenge_categories WHERE name = 'Workforce Development')),
  ('00000000-0000-0000-0006-000000000025', (SELECT id FROM challenge_categories WHERE name = 'Healthcare Access')),
  ('00000000-0000-0000-0006-000000000026', (SELECT id FROM challenge_categories WHERE name = 'Workforce Development')),
  ('00000000-0000-0000-0006-000000000027', (SELECT id FROM challenge_categories WHERE name = 'Community Engagement')),
  ('00000000-0000-0000-0006-000000000028', (SELECT id FROM challenge_categories WHERE name = 'Education Access'))
ON CONFLICT (request_id, challenge_category_id) DO NOTHING;

-- STEP 13: request_identity_categories (16 rows)
INSERT INTO request_identity_categories (request_id, identity_category_id)
VALUES
  ('00000000-0000-0000-0006-000000000001', (SELECT id FROM identity_categories WHERE name = 'Youth')),
  ('00000000-0000-0000-0006-000000000002', (SELECT id FROM identity_categories WHERE name = 'Black/African American')),
  ('00000000-0000-0000-0006-000000000003', (SELECT id FROM identity_categories WHERE name = 'Hispanic/Latinx')),
  ('00000000-0000-0000-0006-000000000004', (SELECT id FROM identity_categories WHERE name = 'Veterans')),
  ('00000000-0000-0000-0006-000000000005', (SELECT id FROM identity_categories WHERE name = 'Seniors')),
  ('00000000-0000-0000-0006-000000000006', (SELECT id FROM identity_categories WHERE name = 'Disability')),
  ('00000000-0000-0000-0006-000000000007', (SELECT id FROM identity_categories WHERE name = 'Youth')),
  ('00000000-0000-0000-0006-000000000008', (SELECT id FROM identity_categories WHERE name = 'Hispanic/Latinx')),
  ('00000000-0000-0000-0006-000000000009', (SELECT id FROM identity_categories WHERE name = 'Seniors')),
  ('00000000-0000-0000-0006-000000000010', (SELECT id FROM identity_categories WHERE name = 'Black/African American')),
  ('00000000-0000-0000-0006-000000000011', (SELECT id FROM identity_categories WHERE name = 'Youth')),
  ('00000000-0000-0000-0006-000000000012', (SELECT id FROM identity_categories WHERE name = 'Hispanic/Latinx')),
  ('00000000-0000-0000-0006-000000000013', (SELECT id FROM identity_categories WHERE name = 'Seniors')),
  ('00000000-0000-0000-0006-000000000014', (SELECT id FROM identity_categories WHERE name = 'Women')),
  ('00000000-0000-0000-0006-000000000015', (SELECT id FROM identity_categories WHERE name = 'Veterans')),
  ('00000000-0000-0000-0006-000000000016', (SELECT id FROM identity_categories WHERE name = 'Disability')),
  -- additional requests 17-28
  ('00000000-0000-0000-0006-000000000017', (SELECT id FROM identity_categories WHERE name = 'Youth')),
  ('00000000-0000-0000-0006-000000000018', (SELECT id FROM identity_categories WHERE name = 'Black/African American')),
  ('00000000-0000-0000-0006-000000000019', (SELECT id FROM identity_categories WHERE name = 'Hispanic/Latinx')),
  ('00000000-0000-0000-0006-000000000020', (SELECT id FROM identity_categories WHERE name = 'Hispanic/Latinx')),
  ('00000000-0000-0000-0006-000000000021', (SELECT id FROM identity_categories WHERE name = 'Seniors')),
  ('00000000-0000-0000-0006-000000000022', (SELECT id FROM identity_categories WHERE name = 'Disability')),
  ('00000000-0000-0000-0006-000000000023', (SELECT id FROM identity_categories WHERE name = 'Youth')),
  ('00000000-0000-0000-0006-000000000024', (SELECT id FROM identity_categories WHERE name = 'Veterans')),
  ('00000000-0000-0000-0006-000000000025', (SELECT id FROM identity_categories WHERE name = 'Seniors')),
  ('00000000-0000-0000-0006-000000000026', (SELECT id FROM identity_categories WHERE name = 'Youth')),
  ('00000000-0000-0000-0006-000000000027', (SELECT id FROM identity_categories WHERE name = 'Hispanic/Latinx')),
  ('00000000-0000-0000-0006-000000000028', (SELECT id FROM identity_categories WHERE name = 'Disability'))
ON CONFLICT (request_id, identity_category_id) DO NOTHING;

-- STEP 14: request_history (14 rows)
INSERT INTO request_history (id, request_id, changed_by_id, old_status, new_status)
VALUES
  ('00000000-0000-0000-0007-000000000001', '00000000-0000-0000-0006-000000000007', '00000000-0000-0000-0003-000000000001', 'open', 'claimed'),
  ('00000000-0000-0000-0007-000000000002', '00000000-0000-0000-0006-000000000008', '00000000-0000-0000-0003-000000000002', 'open', 'claimed'),
  ('00000000-0000-0000-0007-000000000003', '00000000-0000-0000-0006-000000000009', '00000000-0000-0000-0003-000000000003', 'open', 'claimed'),
  ('00000000-0000-0000-0007-000000000004', '00000000-0000-0000-0006-000000000010', '00000000-0000-0000-0003-000000000001', 'open', 'claimed'),
  ('00000000-0000-0000-0007-000000000005', '00000000-0000-0000-0006-000000000010', '00000000-0000-0000-0002-000000000001', 'claimed', 'fulfilled'),
  ('00000000-0000-0000-0007-000000000006', '00000000-0000-0000-0006-000000000011', '00000000-0000-0000-0003-000000000002', 'open', 'claimed'),
  ('00000000-0000-0000-0007-000000000007', '00000000-0000-0000-0006-000000000011', '00000000-0000-0000-0002-000000000001', 'claimed', 'fulfilled'),
  ('00000000-0000-0000-0007-000000000008', '00000000-0000-0000-0006-000000000012', '00000000-0000-0000-0003-000000000003', 'open', 'claimed'),
  ('00000000-0000-0000-0007-000000000009', '00000000-0000-0000-0006-000000000012', '00000000-0000-0000-0002-000000000002', 'claimed', 'fulfilled'),
  ('00000000-0000-0000-0007-000000000010', '00000000-0000-0000-0006-000000000013', '00000000-0000-0000-0003-000000000001', 'open', 'claimed'),
  ('00000000-0000-0000-0007-000000000011', '00000000-0000-0000-0006-000000000013', '00000000-0000-0000-0002-000000000003', 'claimed', 'fulfilled'),
  ('00000000-0000-0000-0007-000000000012', '00000000-0000-0000-0006-000000000014', '00000000-0000-0000-0002-000000000001', 'open', 'denied'),
  ('00000000-0000-0000-0007-000000000013', '00000000-0000-0000-0006-000000000015', '00000000-0000-0000-0002-000000000002', 'open', 'denied'),
  ('00000000-0000-0000-0007-000000000014', '00000000-0000-0000-0006-000000000016', '00000000-0000-0000-0002-000000000003', 'open', 'denied'),
  -- additional history for requests 23-28
  ('00000000-0000-0000-0007-000000000015', '00000000-0000-0000-0006-000000000023', '00000000-0000-0000-0003-000000000002', 'open', 'claimed'),
  ('00000000-0000-0000-0007-000000000016', '00000000-0000-0000-0006-000000000024', '00000000-0000-0000-0003-000000000001', 'open', 'claimed'),
  ('00000000-0000-0000-0007-000000000017', '00000000-0000-0000-0006-000000000025', '00000000-0000-0000-0003-000000000003', 'open', 'claimed'),
  ('00000000-0000-0000-0007-000000000018', '00000000-0000-0000-0006-000000000025', '00000000-0000-0000-0002-000000000003', 'claimed', 'fulfilled'),
  ('00000000-0000-0000-0007-000000000019', '00000000-0000-0000-0006-000000000026', '00000000-0000-0000-0003-000000000002', 'open', 'claimed'),
  ('00000000-0000-0000-0007-000000000020', '00000000-0000-0000-0006-000000000026', '00000000-0000-0000-0002-000000000001', 'claimed', 'fulfilled'),
  ('00000000-0000-0000-0007-000000000021', '00000000-0000-0000-0006-000000000027', '00000000-0000-0000-0002-000000000002', 'open', 'denied'),
  ('00000000-0000-0000-0007-000000000022', '00000000-0000-0000-0006-000000000028', '00000000-0000-0000-0002-000000000003', 'open', 'denied')
ON CONFLICT (id) DO NOTHING;

-- STEP 15: fulfillment_records (4 rows)
INSERT INTO fulfillment_records (id, request_id, donor_id, fulfillment_method, tracking_number, notes, confirmed_by_cbo)
VALUES
  (
    '00000000-0000-0000-0008-000000000001',
    '00000000-0000-0000-0006-000000000010',
    '00000000-0000-0000-0003-000000000001',
    'shipping',
    'UPS1Z999AA10123456784',
    'Shipped via UPS Ground. Donor coordinated delivery with org directly.',
    true
  ),
  (
    '00000000-0000-0000-0008-000000000002',
    '00000000-0000-0000-0006-000000000011',
    '00000000-0000-0000-0003-000000000002',
    'pickup',
    'PICKUP-ORG1-REQ11',
    'Donor dropped off headphones at Connecting Roots KC office on Prospect Ave.',
    true
  ),
  (
    '00000000-0000-0000-0008-000000000003',
    '00000000-0000-0000-0006-000000000012',
    '00000000-0000-0000-0003-000000000003',
    'shipping',
    'FEDEX799505531002',
    'FedEx Ground delivery confirmed. Printer set up by org IT volunteer.',
    true
  ),
  (
    '00000000-0000-0000-0008-000000000004',
    '00000000-0000-0000-0006-000000000013',
    '00000000-0000-0000-0003-000000000001',
    'pickup',
    'PICKUP-ORG3-REQ13',
    'Donor brought tablets to Digital Futures KC office downtown. Cases included.',
    true
  ),
  (
    '00000000-0000-0000-0008-000000000005',
    '00000000-0000-0000-0006-000000000025',
    '00000000-0000-0000-0003-000000000003',
    'shipping',
    'UPS1Z999BB55667788',
    'Bluetooth BP cuff and tablet shipped pre-paired. Org IT volunteer confirmed pairing on arrival.',
    true
  ),
  (
    '00000000-0000-0000-0008-000000000006',
    '00000000-0000-0000-0006-000000000026',
    '00000000-0000-0000-0003-000000000002',
    'pickup',
    'PICKUP-ORG1-REQ26',
    'Donor dropped off 8 refurbished smartphones at Connecting Roots KC. SIM activation handled by org partner.',
    true
  )
ON CONFLICT (id) DO NOTHING;

-- STEP 16: request_notifications (6 rows)
INSERT INTO request_notifications (id, request_id, recipient_id, notification_type, title, message, is_read)
VALUES
  (
    '00000000-0000-0000-0009-000000000001',
    '00000000-0000-0000-0006-000000000007',
    '00000000-0000-0000-0002-000000000001',
    'claimed',
    'Your request has been claimed',
    'A donor has claimed your request for 2 document scanners ($380.00). They will be in touch to arrange delivery.',
    false
  ),
  (
    '00000000-0000-0000-0009-000000000002',
    '00000000-0000-0000-0006-000000000010',
    '00000000-0000-0000-0002-000000000001',
    'fulfilled',
    'Request fulfilled — thank you!',
    'The request for 5 refurbished desktop computers ($750.00) has been marked fulfilled. Great news for your community center.',
    true
  ),
  (
    '00000000-0000-0000-0009-000000000003',
    '00000000-0000-0000-0006-000000000008',
    '00000000-0000-0000-0002-000000000002',
    'claimed',
    'Your request has been claimed',
    'A donor has claimed your request for a standing desk converter ($165.00). They will be in touch to arrange delivery.',
    false
  ),
  (
    '00000000-0000-0000-0009-000000000004',
    '00000000-0000-0000-0006-000000000012',
    '00000000-0000-0000-0002-000000000002',
    'fulfilled',
    'Request fulfilled — thank you!',
    'The request for an HP LaserJet printer ($420.00) has been marked fulfilled. Your participants can now print interview materials.',
    true
  ),
  (
    '00000000-0000-0000-0009-000000000005',
    '00000000-0000-0000-0006-000000000009',
    '00000000-0000-0000-0002-000000000003',
    'claimed',
    'Your request has been claimed',
    'A donor has claimed your request for a video doorbell system ($220.00). They will be in touch to arrange delivery.',
    false
  ),
  (
    '00000000-0000-0000-0009-000000000006',
    '00000000-0000-0000-0006-000000000013',
    '00000000-0000-0000-0002-000000000003',
    'fulfilled',
    'Request fulfilled — thank you!',
    'The request for 3 iPad Air tablets ($560.00) has been marked fulfilled. Your Silver Screens coaches now have dedicated devices.',
    true
  ),
  (
    '00000000-0000-0000-0009-000000000007',
    '00000000-0000-0000-0006-000000000023',
    '00000000-0000-0000-0002-000000000001',
    'claimed',
    'Your request has been claimed',
    'A donor has claimed your request for 3 graphing calculators ($285.00). They will be in touch to arrange delivery.',
    false
  ),
  (
    '00000000-0000-0000-0009-000000000008',
    '00000000-0000-0000-0006-000000000025',
    '00000000-0000-0000-0002-000000000003',
    'fulfilled',
    'Request fulfilled — thank you!',
    'The Bluetooth BP cuff + tablet bundle ($410.00) has been delivered. Your telehealth check-ins can now begin.',
    false
  ),
  (
    '00000000-0000-0000-0009-000000000009',
    '00000000-0000-0000-0006-000000000026',
    '00000000-0000-0000-0002-000000000001',
    'fulfilled',
    'Request fulfilled — thank you!',
    '8 refurbished smartphones ($640.00) have been delivered to your youth job-readiness program. Time to text some employers.',
    true
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- STEP 17: Phase 8 backfill — populate ages_served, pre_eligibility_status,
-- device_type_breakdown, logistics booleans, distribution_method,
-- need_frequency, and 6 essay fields on a selection of orgs/requests so
-- Phase 8 UI components have real data to render. UPDATE statements run
-- after the original INSERTs (which use ON CONFLICT DO NOTHING).
-- ============================================================

-- Organizations — ages_served + pre_eligibility_status for all 3
UPDATE organizations SET
  ages_served            = ARRAY['6-12', '13-17']::text[],
  pre_eligibility_status = 'Youth must be enrolled in a partner KCPS school or affiliated after-school program.'
WHERE id = '00000000-0000-0000-0004-000000000001';

UPDATE organizations SET
  ages_served            = ARRAY['18-24', '25-54']::text[],
  pre_eligibility_status = 'Income-verified or referral from a partner workforce-development agency required.'
WHERE id = '00000000-0000-0000-0004-000000000002';

UPDATE organizations SET
  ages_served            = ARRAY['25-54', '55+']::text[],
  pre_eligibility_status = 'Open to KC-metro residents 55+ or adults with documented accessibility needs.'
WHERE id = '00000000-0000-0000-0004-000000000003';

-- Requests — populate Phase 8 fields on 6 open + 2 fulfilled rows.
-- Remaining rows stay at defaults so the UI also exercises the
-- "no Phase 8 data" empty-state branches.

-- Request 1: 15 Chromebooks for Connecting Roots
UPDATE requests SET
  device_type_breakdown   = '{"laptops": 15}'::jsonb,
  refurbished_ok          = true,
  has_supplier            = false,
  has_it_support          = true,
  distribution_method     = ARRAY['individual']::text[],
  need_frequency          = 'recurring',
  essay_technology_gap    = 'Students in the 64130 corridor have no devices at home. They cannot complete reading homework, watch tutorial videos, or take online practice tests. Each year about 60 of our 200 youth fall behind grade level by spring, and lack of a device is the most cited cause in our annual parent survey.',
  essay_population_impact = 'These 15 Chromebooks would support roughly 45 students rotating through our after-school Digital Seedlings program. Past data shows participating students gain an average of 0.7 grade levels in reading over two semesters when they have take-home device access.',
  essay_it_capacity       = 'Our part-time tech coordinator has been refurbishing donated devices for 4 years. He handles setup, account provisioning, and break/fix support for the entire fleet.'
WHERE id = '00000000-0000-0000-0006-000000000001';

-- Request 3: 10 laptop charging stations for KC Tech Bridge
UPDATE requests SET
  device_type_breakdown   = '{}'::jsonb,
  refurbished_ok          = false,
  has_supplier            = true,
  has_it_support          = false,
  distribution_method     = ARRAY['computer_lab']::text[],
  need_frequency          = 'one_time',
  essay_technology_gap    = 'Participants in our WorkReady lab bring their own laptops but we have no charging infrastructure. Class sessions are interrupted every 90 minutes when devices die, breaking participants'' focus during interview practice and resume work.',
  essay_population_impact = 'We host four 12-week WorkReady cohorts per year, averaging 25 participants per cohort. Charging stations would eliminate ~2 hours of lost class time per week per cohort.',
  essay_urgency_narrative = 'Our spring cohort starts in 6 weeks and we have already had to extend two prior cohorts because of lost charging time.'
WHERE id = '00000000-0000-0000-0006-000000000003';

-- Request 5: 8 large-screen tablets for Digital Futures
UPDATE requests SET
  device_type_breakdown   = '{"tablets": 8}'::jsonb,
  refurbished_ok          = false,
  has_supplier            = true,
  has_it_support          = true,
  distribution_method     = ARRAY['individual', 'shared']::text[],
  need_frequency          = 'one_time',
  essay_technology_gap    = 'Our Silver Screens seniors miss telehealth appointments because phone screens are too small to follow a doctor''s visual instructions. About 30% of our cohort has cancelled at least one appointment in the past 6 months citing screen-size issues.',
  essay_population_impact = '8 large-screen tablets would rotate through our 24-senior cohort plus serve as backup loaners for in-home coaching. Past device additions have correlated with a 40% reduction in cancelled telehealth visits.',
  essay_prior_support     = 'In 2024, AARP KC funded 4 tablets through a pilot. This request would expand on that pilot which proved out the model.',
  essay_sustainability    = 'Tablets stay with the program; we have a 5-year replacement plan funded through our annual community lunch fundraiser.'
WHERE id = '00000000-0000-0000-0006-000000000005';

-- Request 18: mobile hotspots (open, high urgency)
UPDATE requests SET
  device_type_breakdown   = '{}'::jsonb,
  refurbished_ok          = false,
  has_supplier            = true,
  has_it_support          = false,
  distribution_method     = ARRAY['individual']::text[],
  need_frequency          = 'recurring',
  essay_technology_gap    = 'Four of our remote-learning track students lost home Wi-Fi between semesters when their families could not renew service. Without home connectivity they cannot complete daily reading logs or attend evening tutoring.',
  essay_population_impact = 'Immediate impact on 4 students and indirect benefit to their families (8 siblings combined). Hotspots also enable us to keep a 6-month data plan flexible for emergency student needs.',
  essay_urgency_narrative = 'Each day without connectivity sets a student back about a week academically based on our internal data; we are losing students month-over-month.'
WHERE id = '00000000-0000-0000-0006-000000000018';

-- Request 20: bilingual document scanner (open)
UPDATE requests SET
  device_type_breakdown   = '{}'::jsonb,
  refurbished_ok          = true,
  has_supplier            = false,
  has_it_support          = true,
  distribution_method     = ARRAY['shared']::text[],
  need_frequency          = 'one_time',
  essay_technology_gap    = 'Our intake currently relies on volunteer translators reviewing paper documents one-by-one. Cases that should close in 5 days are averaging 18 days.',
  essay_population_impact = 'Bilingual OCR scanner would speed processing for an estimated 150 immigrant intakes per year, cutting wait times by ~70%.',
  essay_it_capacity       = 'Our intake coordinator is already trained on the predecessor model from a partner agency loan. No additional staffing required.'
WHERE id = '00000000-0000-0000-0006-000000000020';

-- Request 22: JAWS screen reader licenses (open, high urgency)
UPDATE requests SET
  device_type_breakdown   = '{}'::jsonb,
  refurbished_ok          = false,
  has_supplier            = true,
  has_it_support          = true,
  distribution_method     = ARRAY['shared']::text[],
  need_frequency          = 'recurring',
  essay_technology_gap    = 'Three participants in our AccessAbility lab cannot complete the Microsoft Office certification track because the lab machines lack screen reader software. Two have deferred the program for a year already.',
  essay_population_impact = 'Three immediate participants; estimated 6-8 additional learners per year as awareness of the lab grows in the blind/low-vision community.',
  essay_sustainability    = 'JAWS licenses are renewed annually via our existing Microsoft TechSoup partnership; this funds the initial 3 seats.'
WHERE id = '00000000-0000-0000-0006-000000000022';

-- Request 10: 5 refurbished desktops (fulfilled — show that fulfilled also has data)
UPDATE requests SET
  device_type_breakdown   = '{"desktops": 5}'::jsonb,
  refurbished_ok          = true,
  has_supplier            = true,
  has_it_support          = true,
  distribution_method     = ARRAY['computer_lab']::text[],
  need_frequency          = 'one_time',
  essay_technology_gap    = 'Community center lab machines were over 12 years old and could not run current Office or web apps. About a third of after-school visitors gave up rather than wait for the slow machines.',
  essay_population_impact = 'Lab serves ~120 students per week. Modern machines have already increased weekly engagement by 22% in the 30 days since install.'
WHERE id = '00000000-0000-0000-0006-000000000010';

-- Request 25: BP cuff + tablet bundle (fulfilled)
UPDATE requests SET
  device_type_breakdown   = '{"tablets": 1}'::jsonb,
  refurbished_ok          = false,
  has_supplier            = true,
  has_it_support          = true,
  distribution_method     = ARRAY['individual']::text[],
  need_frequency          = 'one_time',
  essay_technology_gap    = 'Homebound seniors miss BP-monitoring visits because transportation to clinics is unreliable. Telehealth via a paired BP cuff would close this loop.'
WHERE id = '00000000-0000-0000-0006-000000000025';

-- ============================================================
-- STEP 18: Phase 8.5 mock data — In-Kind Pledges
-- ============================================================
-- 3 new requests (29-31) seeded to demonstrate hybrid donation flow without
-- disturbing the existing Phase 8 demo data on requests 1-28.
-- ============================================================

-- Requests 29, 30, 31 — all start with device_type_breakdown populated
INSERT INTO requests (
  id, organization_id, cause_area_id, donor_id, description, amount,
  urgency, zipcode, status, refurbished_ok, has_supplier, has_it_support
) VALUES
  (
    '00000000-0000-0000-0006-000000000029',
    '00000000-0000-0000-0004-000000000001',
    (SELECT id FROM cause_areas WHERE name = 'Education'),
    NULL,
    '10 refurbished laptops + 5 tablets for our after-school coding cohort. Devices stay with students enrolled in the full-year program.',
    1800.00, 'high', '64130', 'open', true, false, true
  ),
  (
    '00000000-0000-0000-0006-000000000030',
    '00000000-0000-0000-0004-000000000002',
    (SELECT id FROM cause_areas WHERE name = 'Economic Development'),
    NULL,
    '8 desktops for our adult IT-certification training room. Replacing 10-year-old machines that cannot run current courseware.',
    1200.00, 'medium', '64111', 'open', true, true, true
  ),
  (
    '00000000-0000-0000-0006-000000000031',
    '00000000-0000-0000-0004-000000000003',
    (SELECT id FROM cause_areas WHERE name = 'Health & Wellness'),
    NULL,
    '6 large-screen tablets for telehealth coaching for homebound seniors. Replaces a borrowed loaner kit returning to its owner.',
    900.00, 'high', '64106', 'open', false, true, true
  )
ON CONFLICT (id) DO NOTHING;

-- Backfill device_type_breakdown via UPDATE (CHECK constraints on these are already enforced)
UPDATE requests SET device_type_breakdown = '{"laptops": 10, "tablets": 5}'::jsonb,
  distribution_method = ARRAY['individual']::text[], need_frequency = 'recurring'
  WHERE id = '00000000-0000-0000-0006-000000000029';
UPDATE requests SET device_type_breakdown = '{"desktops": 8}'::jsonb,
  distribution_method = ARRAY['computer_lab']::text[], need_frequency = 'one_time'
  WHERE id = '00000000-0000-0000-0006-000000000030';
UPDATE requests SET device_type_breakdown = '{"tablets": 6}'::jsonb,
  distribution_method = ARRAY['shared']::text[], need_frequency = 'one_time'
  WHERE id = '00000000-0000-0000-0006-000000000031';

-- request_challenge_categories + request_identity_categories for new rows
INSERT INTO request_challenge_categories (request_id, challenge_category_id)
VALUES
  ('00000000-0000-0000-0006-000000000029', (SELECT id FROM challenge_categories WHERE name = 'Education Access')),
  ('00000000-0000-0000-0006-000000000030', (SELECT id FROM challenge_categories WHERE name = 'Workforce Development')),
  ('00000000-0000-0000-0006-000000000031', (SELECT id FROM challenge_categories WHERE name = 'Healthcare Access'))
ON CONFLICT (request_id, challenge_category_id) DO NOTHING;

INSERT INTO request_identity_categories (request_id, identity_category_id)
VALUES
  ('00000000-0000-0000-0006-000000000029', (SELECT id FROM identity_categories WHERE name = 'Youth')),
  ('00000000-0000-0000-0006-000000000030', (SELECT id FROM identity_categories WHERE name = 'Hispanic/Latinx')),
  ('00000000-0000-0000-0006-000000000031', (SELECT id FROM identity_categories WHERE name = 'Seniors'))
ON CONFLICT (request_id, identity_category_id) DO NOTHING;

-- Pledge 1 (PENDING) — donor Marcus pledges to Connecting Roots req 30
-- We use req 30 (open, 8 desktops needed) to keep request 29 available
-- for the "open + Cash or Devices" badge demo.
INSERT INTO in_kind_pledges (
  id, request_id, donor_id, device_breakdown, donor_notes, delivery_address, pledge_status
) VALUES (
  '00000000-0000-0000-0012-000000000001',
  '00000000-0000-0000-0006-000000000030',
  '00000000-0000-0000-0003-000000000001',
  '{"desktops": 8}'::jsonb,
  'All 8 desktops are 4-year-old refurbs with i5 CPUs, 16GB RAM, 256GB SSDs. Power cords + keyboards/mice included. Pickup preferred (truck-load).',
  '4200 Wornall Rd, Kansas City, MO 64111',
  'pending'
) ON CONFLICT (id) DO NOTHING;

UPDATE requests SET
  status = 'claimed', donor_id = '00000000-0000-0000-0003-000000000001',
  donation_type = 'in_kind', claimed_at = NOW() - INTERVAL '1 day',
  pledge_id = '00000000-0000-0000-0012-000000000001'
WHERE id = '00000000-0000-0000-0006-000000000030';

INSERT INTO request_history (id, request_id, changed_by_id, old_status, new_status)
VALUES ('00000000-0000-0000-0007-000000000023', '00000000-0000-0000-0006-000000000030',
        '00000000-0000-0000-0003-000000000001', 'open', 'claimed')
ON CONFLICT (id) DO NOTHING;

INSERT INTO request_notifications (id, request_id, recipient_id, notification_type, title, message, is_read)
VALUES (
  '00000000-0000-0000-0009-000000000010',
  '00000000-0000-0000-0006-000000000030',
  '00000000-0000-0000-0002-000000000002',
  'claimed',
  'Device pledge received',
  'Marcus T. pledged 8 desktops for your IT-certification training room. Review and accept to proceed.',
  false
) ON CONFLICT (id) DO NOTHING;

-- Pledge 2 (ACCEPTED, awaiting receipt) — donor Priya pledges to Digital Futures req 31
INSERT INTO in_kind_pledges (
  id, request_id, donor_id, device_breakdown, donor_notes, delivery_address, pledge_status
) VALUES (
  '00000000-0000-0000-0012-000000000002',
  '00000000-0000-0000-0006-000000000031',
  '00000000-0000-0000-0003-000000000002',
  '{"tablets": 6}'::jsonb,
  '6 iPad (9th gen, refurbished). Will ship via UPS Ground when address confirmed.',
  '15 W 10th St, Kansas City, MO 64105',
  'accepted'
) ON CONFLICT (id) DO NOTHING;

UPDATE requests SET
  status = 'claimed', donor_id = '00000000-0000-0000-0003-000000000002',
  donation_type = 'in_kind', claimed_at = NOW() - INTERVAL '3 days',
  pledge_id = '00000000-0000-0000-0012-000000000002'
WHERE id = '00000000-0000-0000-0006-000000000031';

INSERT INTO request_history (id, request_id, changed_by_id, old_status, new_status)
VALUES ('00000000-0000-0000-0007-000000000024', '00000000-0000-0000-0006-000000000031',
        '00000000-0000-0000-0003-000000000002', 'open', 'claimed')
ON CONFLICT (id) DO NOTHING;

-- Unconfirmed fulfillment record (CBO accepted, awaiting physical delivery)
INSERT INTO fulfillment_records (
  id, request_id, donor_id, fulfillment_method, confirmed_by_cbo
) VALUES (
  '00000000-0000-0000-0008-000000000007',
  '00000000-0000-0000-0006-000000000031',
  '00000000-0000-0000-0003-000000000002',
  'in_kind',
  false
) ON CONFLICT (id) DO NOTHING;

INSERT INTO request_notifications (id, request_id, recipient_id, notification_type, title, message, is_read)
VALUES
  (
    '00000000-0000-0000-0009-000000000011',
    '00000000-0000-0000-0006-000000000031',
    '00000000-0000-0000-0002-000000000003',
    'claimed',
    'Device pledge received',
    'Priya S. pledged 6 large-screen tablets. Review and accept to proceed.',
    true
  ),
  (
    '00000000-0000-0000-0009-000000000012',
    '00000000-0000-0000-0006-000000000031',
    '00000000-0000-0000-0003-000000000002',
    'approved',
    'Pledge accepted',
    'Digital Futures KC has accepted your tablet pledge. Coordinate delivery details with them.',
    false
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Additional Phase 8 mock data — diverse edge cases
-- ============================================================

-- Request 2: wireless router upgrade (OPEN) — minimal: only essays, no device counts
UPDATE requests SET
  refurbished_ok          = false,
  has_supplier            = false,
  has_it_support          = true,
  distribution_method     = ARRAY['shared']::text[],
  need_frequency          = 'one_time',
  essay_technology_gap    = 'Our community room''s 8-year-old router drops connections every ~20 minutes during peak hours, interrupting tutoring sessions and online assessments. Last month 3 students lost in-progress test submissions.',
  essay_population_impact = 'Stable Wi-Fi serves all 60+ weekly visitors to the community room: students doing homework, parents in literacy classes, and seniors in our digital literacy circle.'
WHERE id = '00000000-0000-0000-0006-000000000002';

-- Request 4: projector + HDMI cables (OPEN) — single distribution, no IT support
UPDATE requests SET
  device_type_breakdown   = '{}'::jsonb,
  refurbished_ok          = true,
  has_supplier            = false,
  has_it_support          = false,
  distribution_method     = ARRAY['computer_lab']::text[],
  need_frequency          = 'one_time',
  essay_technology_gap    = 'We borrow a projector from a neighboring office twice a week; their schedule conflicts often force us to cancel literacy workshops.',
  essay_population_impact = 'Reliable projector would support our weekly community digital literacy workshops (25 participants average) without scheduling friction.',
  essay_prior_support     = 'No prior support for this specific equipment. We have tried renting twice; both times the rental was unavailable at peak class time.'
WHERE id = '00000000-0000-0000-0006-000000000004';

-- Request 6: 12 Bluetooth keyboard + mouse sets (OPEN, accessibility) — all distribution methods
UPDATE requests SET
  device_type_breakdown   = '{}'::jsonb,
  refurbished_ok          = true,
  has_supplier            = false,
  has_it_support          = true,
  distribution_method     = ARRAY['individual', 'computer_lab', 'shared']::text[],
  need_frequency          = 'recurring',
  essay_technology_gap    = 'Standard keyboards cause hand fatigue and key-press errors for participants with limited fine motor control in our AccessAbility program. We have observed task completion drop by 35% in sessions exceeding 30 minutes.',
  essay_population_impact = '12 BT keyboard/mouse pairs would support all 18 active AccessAbility participants on rotation, with extras for new enrollees.',
  essay_it_capacity       = 'Our accessibility consultant handles assistive-tech setup. Wireless pairing is straightforward and our staff already supports similar devices.',
  essay_sustainability    = 'Devices stay with participants assigned to multi-week training; rotation kit shared in the lab.',
  essay_urgency_narrative = 'New cohort of 6 participants starts in 3 weeks — we need devices before they begin.'
WHERE id = '00000000-0000-0000-0006-000000000006';

-- Request 7: 2 document scanners (CLAIMED) — partial data
UPDATE requests SET
  refurbished_ok          = true,
  has_supplier            = true,
  has_it_support          = true,
  distribution_method     = ARRAY['shared']::text[],
  need_frequency          = 'one_time',
  essay_technology_gap    = 'Scholarship applications require digitized transcripts and financial documents. Without scanners, students rely on phone photos that are often rejected by application portals.',
  essay_population_impact = 'Serves roughly 40 scholarship-bound youth per cycle.'
WHERE id = '00000000-0000-0000-0006-000000000007';

-- Request 11: 10 noise-canceling headphones (FULFILLED) — single essay
UPDATE requests SET
  device_type_breakdown   = '{}'::jsonb,
  refurbished_ok          = false,
  has_supplier            = true,
  has_it_support          = false,
  distribution_method     = ARRAY['computer_lab']::text[],
  need_frequency          = 'one_time',
  essay_technology_gap    = 'Our open-lab coding hours overlapped with neighboring meeting rooms. Students reported difficulty concentrating in 4 of 5 surveyed sessions.'
WHERE id = '00000000-0000-0000-0006-000000000011';

-- Request 13: 3 iPad Air for in-home coaching (FULFILLED) — multi distribution
UPDATE requests SET
  device_type_breakdown   = '{"tablets": 3}'::jsonb,
  refurbished_ok          = false,
  has_supplier            = true,
  has_it_support          = true,
  distribution_method     = ARRAY['individual', 'shared']::text[],
  need_frequency          = 'one_time',
  essay_technology_gap    = 'Coaches were carrying personal devices into client homes, creating an insurance and HIPAA-adjacent risk our board flagged in last year''s audit.',
  essay_it_capacity       = 'Devices are MDM-enrolled by our IT volunteer and remotely wiped after each coaching engagement.',
  essay_sustainability    = 'Tablets ride a 3-year refresh cycle funded by annual board allocation.'
WHERE id = '00000000-0000-0000-0006-000000000013';

-- Request 17: 20 USB-C hubs (OPEN, low) — high count single device type
UPDATE requests SET
  device_type_breakdown   = '{}'::jsonb,
  refurbished_ok          = true,
  has_supplier            = true,
  has_it_support          = false,
  distribution_method     = ARRAY['individual']::text[],
  need_frequency          = 'recurring',
  essay_technology_gap    = 'School-issued laptops have one USB-C port. Students cannot use a mouse and an external drive at the same time, which is required for our cybersecurity track lab exercises.',
  essay_population_impact = '20 hubs serve our cyber/coding club roster of 22 students with two spares.'
WHERE id = '00000000-0000-0000-0006-000000000017';

-- Request 19: 6 webcams + ring lights (OPEN) — workforce focus
UPDATE requests SET
  device_type_breakdown   = '{}'::jsonb,
  refurbished_ok          = false,
  has_supplier            = false,
  has_it_support          = false,
  distribution_method     = ARRAY['shared']::text[],
  need_frequency          = 'one_time',
  essay_technology_gap    = 'Participants on borrowed laptops appear in low light during practice interviews. Two recent participants cited poor presentation as a reason they declined to schedule the real interview.',
  essay_population_impact = 'Shared ring-light kit boosts our 25-participant cohort''s interview readiness without requiring devices to leave the workshop space.',
  essay_urgency_narrative = 'Mock-interview week starts in 4 weeks; we want every participant to look professional on camera.'
WHERE id = '00000000-0000-0000-0006-000000000019';

-- Request 21: 5 universal remotes + smart speakers (OPEN) — multi-device
UPDATE requests SET
  device_type_breakdown   = '{}'::jsonb,
  refurbished_ok          = false,
  has_supplier            = true,
  has_it_support          = true,
  distribution_method     = ARRAY['individual']::text[],
  need_frequency          = 'recurring',
  essay_technology_gap    = 'Seniors with arthritis or low vision struggle with small phone-app interfaces. A pilot showed large-button remotes increased independent device use by 70%.',
  essay_population_impact = '5 pairs serve 10 seniors on rotation through our Silver Screens cohort.',
  essay_prior_support     = 'AARP Kansas funded our 2024 pilot of 2 pairs. This expands on that successful pilot.',
  essay_sustainability    = 'Replacement budget is rolled into our annual Silver Screens line item; recurring tag reflects that.'
WHERE id = '00000000-0000-0000-0006-000000000021';

-- Request 26: 8 refurbished smartphones (FULFILLED) — high-count single device
UPDATE requests SET
  device_type_breakdown   = '{"smartphones": 8}'::jsonb,
  refurbished_ok          = true,
  has_supplier            = true,
  has_it_support          = false,
  distribution_method     = ARRAY['individual']::text[],
  need_frequency          = 'one_time',
  essay_technology_gap    = 'Job-readiness graduates lacked a way to receive employer shift texts; 3 of 12 placements last quarter were lost to "no-call" misunderstandings.',
  essay_population_impact = 'Smartphones bridge the last-mile communication gap for newly placed workers in the first 90 days of employment.',
  essay_sustainability    = 'Donors and graduating cohorts cycle phones back; we maintain a small loaner pool.'
WHERE id = '00000000-0000-0000-0006-000000000026';

-- ============================================================
-- 2026-05-18 MERGE ADDITIONS — mock data for tables from origin/main
-- ============================================================
-- platform_settings and support_faqs already auto-seed via their migrations.
-- The sections below cover what stays empty after migrations.

-- ============================================================
-- STEP 17: support_contact_info — donor SupportPage contact card
-- ============================================================
INSERT INTO support_contact_info (type, label, value, description, sort_order, is_active) VALUES
  ('email',   'General Support',  'support@kcdigitaldrive.org', 'Reply within 1 business day', 1, true),
  ('email',   'Donor Help',       'donors@kcdigitaldrive.org',  'For receipt and tax-document questions', 2, true),
  ('phone',   'Phone (M-F 9-5)',  '+1-816-555-0142',            'Voicemail outside hours', 3, true),
  ('address', 'Mailing Address',  '1200 Main St, Kansas City, MO 64105', NULL, 4, true);

-- ============================================================
-- STEP 18: donor_cause_areas — Phase 9 match-alert subscriptions
-- ============================================================
-- Marcus subscribed to Education + Youth Development (matches several seeded requests)
-- Priya subscribed to Health & Wellness + Housing
-- Donor 3 subscribed to Education only
INSERT INTO donor_cause_areas (donor_id, cause_area_id)
SELECT '00000000-0000-0000-0003-000000000001', id FROM cause_areas WHERE name IN ('Education', 'Youth Development')
UNION ALL
SELECT '00000000-0000-0000-0003-000000000002', id FROM cause_areas WHERE name IN ('Health & Wellness', 'Housing')
UNION ALL
SELECT '00000000-0000-0000-0003-000000000003', id FROM cause_areas WHERE name = 'Education';

-- ============================================================
-- STEP 19: organization_documents — public 501c3 letters + private financials
-- ============================================================
INSERT INTO organization_documents (organization_id, uploaded_by, name, type, size, file_url, year, status, description, is_public) VALUES
  ('00000000-0000-0000-0004-000000000001', '00000000-0000-0000-0002-000000000001',
   '501(c)(3) Determination Letter',           '501c3',              '184 KB', 'https://example.com/docs/connecting-roots-501c3.pdf', 2018, 'ready', 'IRS determination granting tax-exempt status.', true),
  ('00000000-0000-0000-0004-000000000001', '00000000-0000-0000-0002-000000000001',
   '2025 Annual Report',                       'annual_report',      '2.1 MB', 'https://example.com/docs/connecting-roots-annual-2025.pdf', 2025, 'ready', 'Programs, outcomes, and audited financials.', true),
  ('00000000-0000-0000-0004-000000000001', '00000000-0000-0000-0002-000000000001',
   '2025 Form 990',                            'financial_statement','812 KB', 'https://example.com/docs/connecting-roots-990-2025.pdf', 2025, 'ready', 'Public IRS filing.',                       true),
  ('00000000-0000-0000-0004-000000000002', '00000000-0000-0000-0002-000000000002',
   'Tax-Exempt Certificate',                   'tax_exempt',         '92 KB',  'https://example.com/docs/kc-tech-bridge-exempt.pdf',        2019, 'ready', 'Missouri sales-tax exemption.',            true),
  ('00000000-0000-0000-0004-000000000002', '00000000-0000-0000-0002-000000000002',
   '2025 Audit Report',                        'audit_report',       '1.4 MB', 'https://example.com/docs/kc-tech-bridge-audit-2025.pdf',    2025, 'ready', 'Independent auditor report (private).',    false),
  ('00000000-0000-0000-0004-000000000003', '00000000-0000-0000-0002-000000000003',
   '501(c)(3) Determination Letter',           '501c3',              '178 KB', 'https://example.com/docs/digital-futures-501c3.pdf',        2020, 'ready', 'IRS determination letter.',                true),
  ('00000000-0000-0000-0004-000000000003', '00000000-0000-0000-0002-000000000003',
   'Board Bylaws (revised 2025)',              'bylaws',             '256 KB', 'https://example.com/docs/digital-futures-bylaws.pdf',       2025, 'ready', NULL,                                       false);

-- ============================================================
-- STEP 20: donor_documents — tax receipts for fulfilled donations
-- ============================================================
-- One receipt per fulfilled cash donation. Marcus has 2, Priya has 1.
INSERT INTO donor_documents (
  user_id, name, type, size, file_url, year, status,
  organization_id, organization_name, organization_ein,
  donation_amount, donation_date, receipt_number
) VALUES
  ('00000000-0000-0000-0003-000000000001', 'Receipt #R-2025-0042',  'receipt',      '128 KB', 'https://example.com/receipts/r-2025-0042.pdf', 2025, 'ready',
   '00000000-0000-0000-0004-000000000001', 'Connecting Roots KC',  '85-1234567', 350.00, '2025-09-12 14:22:00-05', 'R-2025-0042'),
  ('00000000-0000-0000-0003-000000000001', 'Receipt #R-2025-0078',  'receipt',      '124 KB', 'https://example.com/receipts/r-2025-0078.pdf', 2025, 'ready',
   '00000000-0000-0000-0004-000000000002', 'KC Tech Bridge',       '85-2345678', 220.00, '2025-11-03 09:15:00-06', 'R-2025-0078'),
  ('00000000-0000-0000-0003-000000000002', 'Receipt #R-2025-0093',  'receipt',      '126 KB', 'https://example.com/receipts/r-2025-0093.pdf', 2025, 'ready',
   '00000000-0000-0000-0004-000000000003', 'Digital Futures KC',   '85-3456789', 500.00, '2025-12-18 16:48:00-06', 'R-2025-0093'),
  ('00000000-0000-0000-0003-000000000001', '2025 Annual Summary',   'annual_summary','312 KB', 'https://example.com/receipts/marcus-2025-annual.pdf', 2025, 'ready',
   NULL, NULL, NULL, 570.00, '2026-01-15 00:00:00-06', 'AS-2025-0017');

-- ============================================================
-- STEP 21: campaigns + campaign_questions
-- ============================================================
-- Two active campaigns from two different CBOs, one paused
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
   '<h2>Why this matters</h2><p>Last semester, 18 of our 25 enrolled students had to share a single shelf of Chromebooks rotating between classrooms. Homework went home unfinished, and our retention dropped from 82% to 64% in the spring.</p><p>With <strong>$12,000</strong> we can buy 25 refurbished Lenovo ThinkPads, accessory bundles (mice, sleeves), and a year of break/fix support.</p>',
   'campaigns@connectingroots.org', '+1-816-555-0111',
   'https://example.com/img/connecting-roots-cover.jpg',
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
   'https://example.com/img/digital-futures-mobile-lab.jpg',
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
   'pending');

INSERT INTO campaign_questions (campaign_id, question, submitter_name, submitter_email, status, answer, is_public, answered_at, answered_by) VALUES
  ('00000000-0000-0000-0009-000000000001',
   'Are the laptops new or refurbished? What is the warranty?',
   'Rachel M.', 'rachel.m.donor@example.com',
   'answered',
   'They are professionally refurbished Lenovo ThinkPads with a 1-year parts-and-labor warranty from our supplier. Each unit ships with new battery and SSD.',
   true, '2025-11-08 10:24:00-06', '00000000-0000-0000-0002-000000000001'),
  ('00000000-0000-0000-0009-000000000001',
   'Can I sponsor a specific student?',
   'Anonymous', NULL,
   'pending', NULL, false, NULL, NULL),
  ('00000000-0000-0000-0009-000000000002',
   'How will routes be chosen?',
   'James K.', 'jk@example.com',
   'answered',
   'We are partnering with Mid-America Regional Council to identify zip codes with the lowest fixed-broadband adoption; first four stops are Gladstone, North Kansas City, Parkville, and Liberty.',
   true, '2025-12-14 13:10:00-06', '00000000-0000-0000-0002-000000000003');

-- ============================================================
-- STEP 22: newsletter_subscriptions (Footer signup form)
-- ============================================================
INSERT INTO newsletter_subscriptions (email, source, is_active) VALUES
  ('rachel.m.donor@example.com',  'footer',  true),
  ('marcus.donor@example.com',    'footer',  true),
  ('events-only@example.com',     'about',   true),
  ('unsubscribed@example.com',    'footer',  false);

COMMIT;
