import { cache } from 'react';
import type { CarListing } from '@/types';
import dbConnect from './mongodb';
import Car, { type ICar } from '@/models/Car';
import { convertKrwToUsd } from './currency';

export function serializeOwnCar(car: ICar & { _id: { toString(): string } }): CarListing {
  return {
    id: car._id.toString(), source: 'own', brand: car.brand, model: car.model,
    year: car.year, mileage: car.mileage, fuel: car.fuel, engine: car.engine,
    displacement: car.displacement, hp: car.hp, color: car.color, bodyType: car.bodyType,
    transmission: car.transmission, drivetrain: car.drivetrain,
    price_krw: car.price_krw, price_rub: car.price_rub, price_usd: car.price_usd,
    imageUrl: car.images?.[0] || '/images/no-image.svg', images: car.images || [],
    description: car.description, equipment: car.equipment || [], vin: car.vin,
    location: car.location, isActive: car.isActive, createdAt: car.createdAt?.toISOString(),
  };
}

export async function getOwnCars(includeHidden = false): Promise<CarListing[]> {
  await dbConnect();
  const cars = await Car.find(includeHidden ? {} : { isActive: true }).sort({ createdAt: -1 }).lean();
  return Promise.all(cars.map(async car => {
    const listing = serializeOwnCar(car as unknown as ICar & { _id: { toString(): string } });
    if (!listing.price_usd && listing.price_krw > 0) listing.price_usd = await convertKrwToUsd(listing.price_krw);
    return listing;
  }));
}

export const getOwnCar = cache(async (id: string): Promise<CarListing | null> => {
  if (!/^[a-f0-9]{24}$/i.test(id)) return null;
  await dbConnect();
  const car = await Car.findOne({ _id: id, isActive: true }).lean();
  if (!car) return null;
  const listing = serializeOwnCar(car as unknown as ICar & { _id: { toString(): string } });
  if (!listing.price_usd && listing.price_krw > 0) listing.price_usd = await convertKrwToUsd(listing.price_krw);
  return listing;
});
