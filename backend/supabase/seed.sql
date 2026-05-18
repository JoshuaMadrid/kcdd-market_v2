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
  ('00000000-0000-0000-0003-000000000003', 'donor', false)
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

-- STEP 11: requests (16 rows)
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
  ('00000000-0000-0000-0006-000000000016', (SELECT id FROM challenge_categories WHERE name = 'Community Engagement'))
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
  ('00000000-0000-0000-0006-000000000016', (SELECT id FROM identity_categories WHERE name = 'Disability'))
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
  ('00000000-0000-0000-0007-000000000014', '00000000-0000-0000-0006-000000000016', '00000000-0000-0000-0002-000000000003', 'open', 'denied')
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
  )
ON CONFLICT (id) DO NOTHING;

COMMIT;
