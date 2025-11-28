const db = require('./db');

async function seedDatabase() {
    console.log('🌱 Starting database seed...');

    try {
        // 1. Create Locations
        console.log('📍 Creating locations...');
        const locations = await db.query(`
      INSERT INTO locations (name, address, city, state, zip_code, country, phone, latitude, longitude)
      VALUES 
        ('Downtown Airport', '123 Airport Blvd', 'State College', 'PA', '16801', 'USA', '814-555-0100', 40.7934, -77.8600),
        ('University Campus', '456 College Ave', 'State College', 'PA', '16802', 'USA', '814-555-0200', 40.7982, -77.8599),
        ('North Hills Mall', '789 Mall Drive', 'State College', 'PA', '16803', 'USA', '814-555-0300', 40.8134, -77.8500)
      RETURNING id, name
    `);
        console.log(`✅ Created ${locations.rows.length} locations`);

        // 2. Create Vehicle Categories
        console.log('🚗 Creating vehicle categories...');
        const categories = await db.query(`
      INSERT INTO vehicle_categories (name, description, daily_rate, weekly_rate, monthly_rate, deposit_amount, passenger_capacity, luggage_capacity)
      VALUES 
        ('Economy', 'Fuel-efficient compact cars perfect for city driving', 45.00, 280.00, 1000.00, 200.00, 5, 2),
        ('Sedan', 'Comfortable mid-size sedans for business or leisure', 65.00, 400.00, 1500.00, 300.00, 5, 3),
        ('SUV', 'Spacious SUVs ideal for families and road trips', 95.00, 600.00, 2200.00, 500.00, 7, 5),
        ('Luxury', 'Premium vehicles with top-tier comfort and features', 150.00, 950.00, 3500.00, 1000.00, 5, 3),
        ('Electric', 'Eco-friendly electric vehicles with zero emissions', 85.00, 550.00, 2000.00, 400.00, 5, 2)
      RETURNING id, name
    `);
        console.log(`✅ Created ${categories.rows.length} categories`);

        const locationIds = locations.rows.map(l => l.id);
        const categoryMap = {};
        categories.rows.forEach(c => categoryMap[c.name] = c.id);

        // 3. Create Vehicles
        console.log('🚙 Creating vehicles...');
        const vehicles = [
            // Economy
            { category: 'Economy', location: 0, make: 'Toyota', model: 'Corolla', year: 2023, color: 'Silver', plate: 'ABC1234', vin: '1HGBH41JXMN109186', transmission: 'automatic', fuel: 'gasoline' },
            { category: 'Economy', location: 1, make: 'Honda', model: 'Civic', year: 2023, color: 'Blue', plate: 'DEF5678', vin: '2HGBH41JXMN109187', transmission: 'automatic', fuel: 'gasoline' },
            { category: 'Economy', location: 2, make: 'Hyundai', model: 'Elantra', year: 2024, color: 'White', plate: 'GHI9012', vin: '3HGBH41JXMN109188', transmission: 'automatic', fuel: 'gasoline' },

            // Sedan
            { category: 'Sedan', location: 0, make: 'Honda', model: 'Accord', year: 2023, color: 'Black', plate: 'JKL3456', vin: '4HGBH41JXMN109189', transmission: 'automatic', fuel: 'gasoline' },
            { category: 'Sedan', location: 1, make: 'Toyota', model: 'Camry', year: 2024, color: 'Gray', plate: 'MNO7890', vin: '5HGBH41JXMN109190', transmission: 'automatic', fuel: 'gasoline' },
            { category: 'Sedan', location: 2, make: 'Nissan', model: 'Altima', year: 2023, color: 'Red', plate: 'PQR1234', vin: '6HGBH41JXMN109191', transmission: 'automatic', fuel: 'gasoline' },

            // SUV
            { category: 'SUV', location: 0, make: 'Toyota', model: 'RAV4', year: 2024, color: 'Blue', plate: 'STU5678', vin: '7HGBH41JXMN109192', transmission: 'automatic', fuel: 'gasoline' },
            { category: 'SUV', location: 1, make: 'Honda', model: 'CR-V', year: 2023, color: 'White', plate: 'VWX9012', vin: '8HGBH41JXMN109193', transmission: 'automatic', fuel: 'gasoline' },
            { category: 'SUV', location: 2, make: 'Ford', model: 'Explorer', year: 2024, color: 'Black', plate: 'YZA3456', vin: '9HGBH41JXMN109194', transmission: 'automatic', fuel: 'gasoline' },

            // Luxury
            { category: 'Luxury', location: 0, make: 'BMW', model: '5 Series', year: 2024, color: 'Silver', plate: 'BCD7890', vin: 'AHGBH41JXMN109195', transmission: 'automatic', fuel: 'gasoline' },
            { category: 'Luxury', location: 1, make: 'Mercedes-Benz', model: 'E-Class', year: 2024, color: 'Black', plate: 'EFG1234', vin: 'BHGBH41JXMN109196', transmission: 'automatic', fuel: 'gasoline' },

            // Electric
            { category: 'Electric', location: 0, make: 'Tesla', model: 'Model 3', year: 2024, color: 'White', plate: 'HIJ5678', vin: 'CHGBH41JXMN109197', transmission: 'automatic', fuel: 'electric' },
            { category: 'Electric', location: 1, make: 'Tesla', model: 'Model Y', year: 2024, color: 'Blue', plate: 'KLM9012', vin: 'DHGBH41JXMN109198', transmission: 'automatic', fuel: 'electric' },
        ];

        for (const v of vehicles) {
            await db.query(`
        INSERT INTO vehicles (category_id, location_id, make, model, year, color, license_plate, vin, mileage, status, transmission, fuel_type, features)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'available', $10, $11, $12)
      `, [
                categoryMap[v.category],
                locationIds[v.location],
                v.make,
                v.model,
                v.year,
                v.color,
                v.plate,
                v.vin,
                Math.floor(Math.random() * 50000),
                v.transmission,
                v.fuel,
                JSON.stringify({
                    bluetooth: true,
                    gps: true,
                    backup_camera: true,
                    cruise_control: true,
                    air_conditioning: true
                })
            ]);
        }
        console.log(`✅ Created ${vehicles.length} vehicles`);

        // 4. Create Users
        console.log('👥 Creating users...');
        const bcrypt = require('bcrypt');

        // Admin user
        const adminPassword = await bcrypt.hash('admin123', 10);
        await db.query(`
      INSERT INTO users (email, password_hash, first_name, last_name, phone, role)
      VALUES ('admin@rentalcar.com', $1, 'Admin', 'User', '814-555-9999', 'admin')
    `, [adminPassword]);

        // Customer users
        const customerPassword = await bcrypt.hash('customer123', 10);
        const customers = [
            { email: 'john.doe@email.com', first: 'John', last: 'Doe', phone: '814-555-1111' },
            { email: 'jane.smith@email.com', first: 'Jane', last: 'Smith', phone: '814-555-2222' },
            { email: 'mike.johnson@email.com', first: 'Mike', last: 'Johnson', phone: '814-555-3333' },
        ];

        for (const c of customers) {
            await db.query(`
        INSERT INTO users (email, password_hash, first_name, last_name, phone, role)
        VALUES ($1, $2, $3, $4, $5, 'customer')
      `, [c.email, customerPassword, c.first, c.last, c.phone]);
        }
        console.log(`✅ Created ${customers.length + 1} users`);

        console.log('\n🎉 Database seeded successfully!');
        console.log('\n📝 Login Credentials:');
        console.log('   Admin: admin@rentalcar.com / admin123');
        console.log('   Customer: john.doe@email.com / customer123');
        console.log('   Customer: jane.smith@email.com / customer123');
        console.log('   Customer: mike.johnson@email.com / customer123');

    } catch (error) {
        console.error('❌ Error seeding database:', error);
        throw error;
    } finally {
        await db.close();
    }
}

// Run the seed
seedDatabase()
    .then(() => {
        console.log('\n✅ Seed completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Seed failed:', error);
        process.exit(1);
    });
