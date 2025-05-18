-- Seed data for repair quotes market data

-- Sample Car Owners (for demo purposes)
INSERT INTO profiles (id, email, user_type, full_name, phone)
VALUES 
  ('d8fc7be7-3e20-4254-8d1e-c254ca8e81a9', 'demo_owner1@example.com', 'car_owner', 'Demo Owner 1', '555-123-4567'),
  ('a2b99cb1-df12-4b42-9a9c-b98d6c7a010f', 'demo_owner2@example.com', 'car_owner', 'Demo Owner 2', '555-234-5678')
ON CONFLICT (id) DO NOTHING;

-- Sample Mechanics (for demo purposes)
INSERT INTO profiles (id, email, user_type, full_name, phone)
VALUES 
  ('f5b87937-c08e-4cac-9a2d-3b68af310c8e', 'demo_mech1@example.com', 'mechanic', 'Demo Mechanic 1', '555-321-7654'),
  ('e741c1d2-4e7c-4b7d-a93f-1f2b5e3a8c91', 'demo_mech2@example.com', 'mechanic', 'Demo Mechanic 2', '555-432-8765'),
  ('b9c6e2a1-8d4f-4f7a-b2c3-1d4e5f6a7b8c', 'demo_mech3@example.com', 'mechanic', 'Demo Mechanic 3', '555-543-9876')
ON CONFLICT (id) DO NOTHING;

-- Insert mechanics
INSERT INTO mechanics (id, business_name, business_address, business_phone, service_radius, specialties, average_rating, review_count)
VALUES
  ('f5b87937-c08e-4cac-9a2d-3b68af310c8e', 'Quality Auto Shop', '123 Main St, Anytown', '555-321-7654', 25, ARRAY['Engine', 'Transmission', 'Electrical'], 4.7, 156),
  ('e741c1d2-4e7c-4b7d-a93f-1f2b5e3a8c91', 'Precision Mechanics', '456 Oak Ave, Othertown', '555-432-8765', 15, ARRAY['Brakes', 'Suspension', 'Diagnostic'], 4.5, 98),
  ('b9c6e2a1-8d4f-4f7a-b2c3-1d4e5f6a7b8c', 'Fast Lane Repairs', '789 Elm St, Sometown', '555-543-9876', 30, ARRAY['Electrical', 'AC/Heating', 'Maintenance'], 4.2, 73)
ON CONFLICT (id) DO NOTHING;

-- Sample common repair issues across different makes/models/years
INSERT INTO repair_requests (id, car_owner_id, car_make, car_model, car_year, issue_type, description, location, preferred_service_type, status, created_at)
VALUES
  -- Engine Issues
  ('be21c9af-c987-4d2e-a933-8d4e1c6b3a7d', 'd8fc7be7-3e20-4254-8d1e-c254ca8e81a9', 'Toyota', 'Camry', 2018, 'Engine', 'Check engine light on, rough idle', 'Boston, MA', 'any', 'completed', NOW() - INTERVAL '60 days'),
  ('a4e5f6g7-h8i9-j0k1-l2m3-n4o5p6q7r8s9', 'd8fc7be7-3e20-4254-8d1e-c254ca8e81a9', 'Honda', 'Accord', 2019, 'Engine', 'Engine stalling at stops', 'Cambridge, MA', 'any', 'completed', NOW() - INTERVAL '45 days'),
  ('t1u2v3w4-x5y6-z7a8-b9c0-d1e2f3g4h5i6', 'a2b99cb1-df12-4b42-9a9c-b98d6c7a010f', 'Ford', 'F-150', 2020, 'Engine', 'Loss of power while accelerating', 'Somerville, MA', 'any', 'completed', NOW() - INTERVAL '30 days'),
  
  -- Transmission Issues
  ('j7k8l9m0-n1o2-p3q4-r5s6-t7u8v9w0x1y2', 'd8fc7be7-3e20-4254-8d1e-c254ca8e81a9', 'Chevrolet', 'Malibu', 2017, 'Transmission', 'Transmission slipping when shifting', 'Boston, MA', 'any', 'completed', NOW() - INTERVAL '75 days'),
  ('z3a4b5c6-d7e8-f9g0-h1i2-j3k4l5m6n7o8', 'a2b99cb1-df12-4b42-9a9c-b98d6c7a010f', 'Toyota', 'RAV4', 2018, 'Transmission', 'Delayed engagement when shifting from park', 'Medford, MA', 'any', 'completed', NOW() - INTERVAL '60 days'),
  ('p9q0r1s2-t3u4-v5w6-x7y8-z9a0b1c2d3e4', 'd8fc7be7-3e20-4254-8d1e-c254ca8e81a9', 'Nissan', 'Altima', 2019, 'Transmission', 'Strange noises when in reverse', 'Brookline, MA', 'any', 'completed', NOW() - INTERVAL '50 days'),
  
  -- Brake Issues
  ('f5g6h7i8-j9k0-l1m2-n3o4-p5q6r7s8t9u0', 'a2b99cb1-df12-4b42-9a9c-b98d6c7a010f', 'Honda', 'Civic', 2020, 'Brakes', 'Squeaking noise when braking', 'Boston, MA', 'any', 'completed', NOW() - INTERVAL '90 days'),
  ('v1w2x3y4-z5a6-b7c8-d9e0-f1g2h3i4j5k6', 'd8fc7be7-3e20-4254-8d1e-c254ca8e81a9', 'Hyundai', 'Elantra', 2018, 'Brakes', 'Pulsating brake pedal', 'Newton, MA', 'any', 'completed', NOW() - INTERVAL '70 days'),
  ('l7m8n9o0-p1q2-r3s4-t5u6-v7w8x9y0z1a2', 'a2b99cb1-df12-4b42-9a9c-b98d6c7a010f', 'Ford', 'Escape', 2019, 'Brakes', 'Brakes making grinding sound', 'Cambridge, MA', 'any', 'completed', NOW() - INTERVAL '40 days'),
  
  -- Electrical Issues
  ('b3c4d5e6-f7g8-h9i0-j1k2-l3m4n5o6p7q8', 'd8fc7be7-3e20-4254-8d1e-c254ca8e81a9', 'Toyota', 'Corolla', 2017, 'Electrical', 'Battery not holding charge', 'Somerville, MA', 'any', 'completed', NOW() - INTERVAL '85 days'),
  ('r9s0t1u2-v3w4-x5y6-z7a8-b9c0d1e2f3g4', 'a2b99cb1-df12-4b42-9a9c-b98d6c7a010f', 'Kia', 'Optima', 2018, 'Electrical', 'Power windows not working', 'Quincy, MA', 'any', 'completed', NOW() - INTERVAL '65 days'),
  ('h5i6j7k8-l9m0-n1o2-p3q4-r5s6t7u8v9w0', 'd8fc7be7-3e20-4254-8d1e-c254ca8e81a9', 'Volkswagen', 'Jetta', 2019, 'Electrical', 'Intermittent starting issues', 'Boston, MA', 'any', 'completed', NOW() - INTERVAL '35 days'),
  
  -- AC/Heating Issues
  ('x1y2z3a4-b5c6-d7e8-f9g0-h1i2j3k4l5m6', 'a2b99cb1-df12-4b42-9a9c-b98d6c7a010f', 'Honda', 'CR-V', 2020, 'AC/Heating', 'AC not blowing cold air', 'Cambridge, MA', 'any', 'completed', NOW() - INTERVAL '80 days'),
  ('n7o8p9q0-r1s2-t3u4-v5w6-x7y8z9a0b1c2', 'd8fc7be7-3e20-4254-8d1e-c254ca8e81a9', 'Subaru', 'Outback', 2017, 'AC/Heating', 'Heater only blowing lukewarm air', 'Newton, MA', 'any', 'completed', NOW() - INTERVAL '55 days'),
  ('d3e4f5g6-h7i8-j9k0-l1m2-n3o4p5q6r7s8', 'a2b99cb1-df12-4b42-9a9c-b98d6c7a010f', 'Mazda', 'CX-5', 2018, 'AC/Heating', 'Strange smell from vents when AC on', 'Brookline, MA', 'any', 'completed', NOW() - INTERVAL '25 days'),
  
  -- Suspension Issues
  ('t9u0v1w2-x3y4-z5a6-b7c8-d9e0f1g2h3i4', 'd8fc7be7-3e20-4254-8d1e-c254ca8e81a9', 'Ford', 'Focus', 2019, 'Suspension', 'Car bouncing excessively on bumps', 'Boston, MA', 'any', 'completed', NOW() - INTERVAL '95 days'),
  ('j5k6l7m8-n9o0-p1q2-r3s4-t5u6v7w8x9y0', 'a2b99cb1-df12-4b42-9a9c-b98d6c7a010f', 'Chevrolet', 'Equinox', 2020, 'Suspension', 'Clunking noise when going over bumps', 'Medford, MA', 'any', 'completed', NOW() - INTERVAL '75 days'),
  ('z1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o6', 'd8fc7be7-3e20-4254-8d1e-c254ca8e81a9', 'Hyundai', 'Tucson', 2018, 'Suspension', 'Car pulling to one side', 'Somerville, MA', 'any', 'completed', NOW() - INTERVAL '45 days'),
  
  -- Oil Change/Maintenance
  ('p7q8r9s0-t1u2-v3w4-x5y6-z7a8b9c0d1e2', 'a2b99cb1-df12-4b42-9a9c-b98d6c7a010f', 'Toyota', 'Highlander', 2017, 'Maintenance', 'Regular oil change and inspection', 'Cambridge, MA', 'any', 'completed', NOW() - INTERVAL '100 days'),
  ('f3g4h5i6-j7k8-l9m0-n1o2-p3q4r5s6t7u8', 'd8fc7be7-3e20-4254-8d1e-c254ca8e81a9', 'Honda', 'Pilot', 2019, 'Maintenance', 'Oil change and tire rotation', 'Boston, MA', 'any', 'completed', NOW() - INTERVAL '70 days'),
  ('v9w0x1y2-z3a4-b5c6-d7e8-f9g0h1i2j3k4', 'a2b99cb1-df12-4b42-9a9c-b98d6c7a010f', 'Nissan', 'Rogue', 2020, 'Maintenance', '30,000 mile service', 'Newton, MA', 'any', 'completed', NOW() - INTERVAL '40 days')
ON CONFLICT (id) DO NOTHING;

-- Sample quotes for each repair request (varying price points to show market range)
INSERT INTO repair_quotes (id, repair_request_id, mechanic_id, amount, description, estimated_hours, status, created_at)
VALUES
  -- Engine Quotes
  ('11111111-1111-1111-1111-111111111111', 'be21c9af-c987-4d2e-a933-8d4e1c6b3a7d', 'f5b87937-c08e-4cac-9a2d-3b68af310c8e', 150.00, 'Diagnostic test, clean sensors', 1, 'accepted', NOW() - INTERVAL '58 days'),
  ('22222222-2222-2222-2222-222222222222', 'be21c9af-c987-4d2e-a933-8d4e1c6b3a7d', 'e741c1d2-4e7c-4b7d-a93f-1f2b5e3a8c91', 175.00, 'Full diagnostic and sensor inspection', 1.5, 'rejected', NOW() - INTERVAL '59 days'),
  ('33333333-3333-3333-3333-333333333333', 'be21c9af-c987-4d2e-a933-8d4e1c6b3a7d', 'b9c6e2a1-8d4f-4f7a-b2c3-1d4e5f6a7b8c', 195.00, 'Diagnostic with advanced computer scan', 2, 'rejected', NOW() - INTERVAL '59 days'),
  
  ('44444444-4444-4444-4444-444444444444', 'a4e5f6g7-h8i9-j0k1-l2m3-n4o5p6q7r8s9', 'f5b87937-c08e-4cac-9a2d-3b68af310c8e', 320.00, 'Replace idle control valve', 2, 'accepted', NOW() - INTERVAL '43 days'),
  ('55555555-5555-5555-5555-555555555555', 'a4e5f6g7-h8i9-j0k1-l2m3-n4o5p6q7r8s9', 'e741c1d2-4e7c-4b7d-a93f-1f2b5e3a8c91', 285.00, 'Clean throttle body and replace idle air control valve', 2.5, 'rejected', NOW() - INTERVAL '44 days'),
  
  ('66666666-6666-6666-6666-666666666666', 't1u2v3w4-x5y6-z7a8-b9c0-d1e2f3g4h5i6', 'b9c6e2a1-8d4f-4f7a-b2c3-1d4e5f6a7b8c', 550.00, 'Fuel system cleaning and fuel filter replacement', 3, 'accepted', NOW() - INTERVAL '28 days'),
  ('77777777-7777-7777-7777-777777777777', 't1u2v3w4-x5y6-z7a8-b9c0-d1e2f3g4h5i6', 'f5b87937-c08e-4cac-9a2d-3b68af310c8e', 600.00, 'Complete fuel system service and fuel pump inspection', 4, 'rejected', NOW() - INTERVAL '29 days'),
  
  -- Transmission Quotes
  ('88888888-8888-8888-8888-888888888888', 'j7k8l9m0-n1o2-p3q4-r5s6-t7u8v9w0x1y2', 'e741c1d2-4e7c-4b7d-a93f-1f2b5e3a8c91', 900.00, 'Transmission fluid flush and filter change', 3, 'accepted', NOW() - INTERVAL '73 days'),
  ('99999999-9999-9999-9999-999999999999', 'j7k8l9m0-n1o2-p3q4-r5s6-t7u8v9w0x1y2', 'b9c6e2a1-8d4f-4f7a-b2c3-1d4e5f6a7b8c', 850.00, 'Transmission service with fluid exchange', 2.5, 'rejected', NOW() - INTERVAL '74 days'),
  
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'z3a4b5c6-d7e8-f9g0-h1i2-j3k4l5m6n7o8', 'f5b87937-c08e-4cac-9a2d-3b68af310c8e', 650.00, 'Adjust shift linkage and change fluid', 4, 'accepted', NOW() - INTERVAL '58 days'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'z3a4b5c6-d7e8-f9g0-h1i2-j3k4l5m6n7o8', 'e741c1d2-4e7c-4b7d-a93f-1f2b5e3a8c91', 700.00, 'Transmission diagnostic and adjustment', 5, 'rejected', NOW() - INTERVAL '59 days'),
  
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'p9q0r1s2-t3u4-v5w6-x7y8-z9a0b1c2d3e4', 'b9c6e2a1-8d4f-4f7a-b2c3-1d4e5f6a7b8c', 480.00, 'Check and fix reverse gear issue', 3, 'accepted', NOW() - INTERVAL '48 days'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'p9q0r1s2-t3u4-v5w6-x7y8-z9a0b1c2d3e4', 'f5b87937-c08e-4cac-9a2d-3b68af310c8e', 520.00, 'Full transmission diagnostic and reverse gear adjustment', 3.5, 'rejected', NOW() - INTERVAL '49 days'),
  
  -- Brake Quotes
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'f5g6h7i8-j9k0-l1m2-n3o4-p5q6r7s8t9u0', 'e741c1d2-4e7c-4b7d-a93f-1f2b5e3a8c91', 320.00, 'Brake pad replacement', 2, 'accepted', NOW() - INTERVAL '88 days'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'f5g6h7i8-j9k0-l1m2-n3o4-p5q6r7s8t9u0', 'b9c6e2a1-8d4f-4f7a-b2c3-1d4e5f6a7b8c', 350.00, 'Replace brake pads and lubricate caliper pins', 2.5, 'rejected', NOW() - INTERVAL '89 days'),
  
  ('gggggggg-gggg-gggg-gggg-gggggggggggg', 'v1w2x3y4-z5a6-b7c8-d9e0-f1g2h3i4j5k6', 'f5b87937-c08e-4cac-9a2d-3b68af310c8e', 450.00, 'Brake rotor resurfacing', 3, 'accepted', NOW() - INTERVAL '68 days'),
  ('hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'v1w2x3y4-z5a6-b7c8-d9e0-f1g2h3i4j5k6', 'e741c1d2-4e7c-4b7d-a93f-1f2b5e3a8c91', 480.00, 'Brake rotor machining and system inspection', 3.5, 'rejected', NOW() - INTERVAL '69 days'),
  
  ('iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', 'l7m8n9o0-p1q2-r3s4-t5u6-v7w8x9y0z1a2', 'b9c6e2a1-8d4f-4f7a-b2c3-1d4e5f6a7b8c', 680.00, 'Complete brake system overhaul', 4, 'accepted', NOW() - INTERVAL '38 days'),
  ('jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj', 'l7m8n9o0-p1q2-r3s4-t5u6-v7w8x9y0z1a2', 'f5b87937-c08e-4cac-9a2d-3b68af310c8e', 720.00, 'Brake pad and rotor replacement', 5, 'rejected', NOW() - INTERVAL '39 days'),
  
  -- Electrical Quotes
  ('kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk', 'b3c4d5e6-f7g8-h9i0-j1k2-l3m4n5o6p7q8', 'e741c1d2-4e7c-4b7d-a93f-1f2b5e3a8c91', 180.00, 'Battery test and charging system check', 1, 'accepted', NOW() - INTERVAL '83 days'),
  ('llllllll-llll-llll-llll-llllllllllll', 'b3c4d5e6-f7g8-h9i0-j1k2-l3m4n5o6p7q8', 'b9c6e2a1-8d4f-4f7a-b2c3-1d4e5f6a7b8c', 200.00, 'Battery and alternator testing', 1.5, 'rejected', NOW() - INTERVAL '84 days'),
  
  ('mmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmmmmmm', 'r9s0t1u2-v3w4-x5y6-z7a8-b9c0d1e2f3g4', 'f5b87937-c08e-4cac-9a2d-3b68af310c8e', 280.00, 'Window regulator replacement', 2, 'accepted', NOW() - INTERVAL '63 days'),
  ('nnnnnnnn-nnnn-nnnn-nnnn-nnnnnnnnnnnn', 'r9s0t1u2-v3w4-x5y6-z7a8-b9c0d1e2f3g4', 'e741c1d2-4e7c-4b7d-a93f-1f2b5e3a8c91', 320.00, 'Power window motor and regulator replacement', 2.5, 'rejected', NOW() - INTERVAL '64 days'),
  
  ('oooooooo-oooo-oooo-oooo-oooooooooooo', 'h5i6j7k8-l9m0-n1o2-p3q4-r5s6t7u8v9w0', 'b9c6e2a1-8d4f-4f7a-b2c3-1d4e5f6a7b8c', 230.00, 'Starter inspection and battery test', 1.5, 'accepted', NOW() - INTERVAL '33 days'),
  ('pppppppp-pppp-pppp-pppp-pppppppppppp', 'h5i6j7k8-l9m0-n1o2-p3q4-r5s6t7u8v9w0', 'f5b87937-c08e-4cac-9a2d-3b68af310c8e', 250.00, 'Starting system diagnostic and service', 2, 'rejected', NOW() - INTERVAL '34 days'),
  
  -- AC/Heating Quotes
  ('qqqqqqqq-qqqq-qqqq-qqqq-qqqqqqqqqqqq', 'x1y2z3a4-b5c6-d7e8-f9g0-h1i2j3k4l5m6', 'e741c1d2-4e7c-4b7d-a93f-1f2b5e3a8c91', 370.00, 'AC recharge and leak detection', 2, 'accepted', NOW() - INTERVAL '78 days'),
  ('rrrrrrrr-rrrr-rrrr-rrrr-rrrrrrrrrrrr', 'x1y2z3a4-b5c6-d7e8-f9g0-h1i2j3k4l5m6', 'b9c6e2a1-8d4f-4f7a-b2c3-1d4e5f6a7b8c', 400.00, 'AC system service and refrigerant recharge', 2.5, 'rejected', NOW() - INTERVAL '79 days'),
  
  ('ssssssss-ssss-ssss-ssss-ssssssssssss', 'n7o8p9q0-r1s2-t3u4-v5w6-x7y8z9a0b1c2', 'f5b87937-c08e-4cac-9a2d-3b68af310c8e', 420.00, 'Heater core flush, thermostat replacement', 3, 'accepted', NOW() - INTERVAL '53 days'),
  ('tttttttt-tttt-tttt-tttt-tttttttttttt', 'n7o8p9q0-r1s2-t3u4-v5w6-x7y8z9a0b1c2', 'e741c1d2-4e7c-4b7d-a93f-1f2b5e3a8c91', 450.00, 'Heating system service including thermostat', 3.5, 'rejected', NOW() - INTERVAL '54 days'),
  
  ('uuuuuuuu-uuuu-uuuu-uuuu-uuuuuuuuuuuu', 'd3e4f5g6-h7i8-j9k0-l1m2-n3o4p5q6r7s8', 'b9c6e2a1-8d4f-4f7a-b2c3-1d4e5f6a7b8c', 180.00, 'Evaporator cleaning and disinfection', 1.5, 'accepted', NOW() - INTERVAL '23 days'),
  ('vvvvvvvv-vvvv-vvvv-vvvv-vvvvvvvvvvvv', 'd3e4f5g6-h7i8-j9k0-l1m2-n3o4p5q6r7s8', 'f5b87937-c08e-4cac-9a2d-3b68af310c8e', 210.00, 'AC system cleaning and odor removal', 2, 'rejected', NOW() - INTERVAL '24 days'),
  
  -- Suspension Quotes
  ('wwwwwwww-wwww-wwww-wwww-wwwwwwwwwwww', 't9u0v1w2-x3y4-z5a6-b7c8-d9e0f1g2h3i4', 'e741c1d2-4e7c-4b7d-a93f-1f2b5e3a8c91', 580.00, 'Strut replacement (front pair)', 4, 'accepted', NOW() - INTERVAL '93 days'),
  ('xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', 't9u0v1w2-x3y4-z5a6-b7c8-d9e0f1g2h3i4', 'b9c6e2a1-8d4f-4f7a-b2c3-1d4e5f6a7b8c', 620.00, 'Front strut replacement with alignment', 5, 'rejected', NOW() - INTERVAL '94 days'),
  
  ('yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy', 'j5k6l7m8-n9o0-p1q2-r3s4-t5u6v7w8x9y0', 'f5b87937-c08e-4cac-9a2d-3b68af310c8e', 430.00, 'Control arm bushings replacement', 3, 'accepted', NOW() - INTERVAL '73 days'),
  ('zzzzzzzz-zzzz-zzzz-zzzz-zzzzzzzzzzzz', 'j5k6l7m8-n9o0-p1q2-r3s4-t5u6v7w8x9y0', 'e741c1d2-4e7c-4b7d-a93f-1f2b5e3a8c91', 460.00, 'Control arm and bushing replacement', 3.5, 'rejected', NOW() - INTERVAL '74 days'),
  
  ('a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'z1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o6', 'b9c6e2a1-8d4f-4f7a-b2c3-1d4e5f6a7b8c', 90.00, 'Alignment only', 1, 'accepted', NOW() - INTERVAL '43 days'),
  ('b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2', 'z1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o6', 'f5b87937-c08e-4cac-9a2d-3b68af310c8e', 120.00, 'Four wheel alignment and tire rotation', 1.5, 'rejected', NOW() - INTERVAL '44 days'),
  
  -- Maintenance Quotes
  ('c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3', 'p7q8r9s0-t1u2-v3w4-x5y6-z7a8b9c0d1e2', 'e741c1d2-4e7c-4b7d-a93f-1f2b5e3a8c91', 60.00, 'Basic oil change', 0.5, 'accepted', NOW() - INTERVAL '98 days'),
  ('d4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d4d4', 'p7q8r9s0-t1u2-v3w4-x5y6-z7a8b9c0d1e2', 'b9c6e2a1-8d4f-4f7a-b2c3-1d4e5f6a7b8c', 80.00, 'Premium oil change with multi-point inspection', 1, 'rejected', NOW() - INTERVAL '99 days'),
  
  ('e5e5e5e5-e5e5-e5e5-e5e5-e5e5e5e5e5e5', 'f3g4h5i6-j7k8-l9m0-n1o2-p3q4r5s6t7u8', 'f5b87937-c08e-4cac-9a2d-3b68af310c8e', 120.00, 'Oil change and tire rotation', 1, 'accepted', NOW() - INTERVAL '68 days'),
  ('f6f6f6f6-f6f6-f6f6-f6f6-f6f6f6f6f6f6', 'f3g4h5i6-j7k8-l9m0-n1o2-p3q4r5s6t7u8', 'e741c1d2-4e7c-4b7d-a93f-1f2b5e3a8c91', 140.00, 'Full service oil change with rotation and inspection', 1.5, 'rejected', NOW() - INTERVAL '69 days'),
  
  ('g7g7g7g7-g7g7-g7g7-g7g7-g7g7g7g7g7g7', 'v9w0x1y2-z3a4-b5c6-d7e8-f9g0h1i2j3k4', 'b9c6e2a1-8d4f-4f7a-b2c3-1d4e5f6a7b8c', 420.00, '30K mile service package', 3, 'accepted', NOW() - INTERVAL '38 days'),
  ('h8h8h8h8-h8h8-h8h8-h8h8-h8h8h8h8h8h8', 'v9w0x1y2-z3a4-b5c6-d7e8-f9g0h1i2j3k4', 'f5b87937-c08e-4cac-9a2d-3b68af310c8e', 450.00, 'Complete 30K mile maintenance service', 3.5, 'rejected', NOW() - INTERVAL '39 days')
ON CONFLICT (id) DO NOTHING; 