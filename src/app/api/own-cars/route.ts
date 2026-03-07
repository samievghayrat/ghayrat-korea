import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const { default: dbConnect } = await import('@/lib/mongodb');
    const { default: Car } = await import('@/models/Car');
    await dbConnect();

    const cars = await Car.find().sort({ createdAt: -1 }).lean();
    const formatted = cars.map((car) => ({
      id: car._id.toString(),
      source: 'own',
      brand: car.brand,
      model: car.model,
      year: car.year,
      mileage: car.mileage,
      fuel: car.fuel,
      engine: car.engine,
      displacement: car.displacement,
      hp: car.hp,
      color: car.color,
      bodyType: car.bodyType,
      transmission: car.transmission,
      drivetrain: car.drivetrain,
      price_krw: car.price_krw,
      price_rub: car.price_rub,
      price_usd: car.price_usd,
      imageUrl: car.images?.[0] || '/images/no-image.svg',
      images: car.images || [],
      description: car.description,
      equipment: car.equipment || [],
      vin: car.vin,
      isActive: car.isActive,
      createdAt: car.createdAt,
    }));

    return NextResponse.json({ cars: formatted });
  } catch {
    return NextResponse.json({ cars: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { default: dbConnect } = await import('@/lib/mongodb');
    const { default: Car } = await import('@/models/Car');
    await dbConnect();

    const body = await request.json();
    const car = await Car.create(body);
    return NextResponse.json({ id: car._id.toString() }, { status: 201 });
  } catch (error) {
    console.error('Create car error:', error);
    return NextResponse.json({ error: 'Failed to create car' }, { status: 500 });
  }
}
