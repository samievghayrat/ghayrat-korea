import { readFile, writeFile } from 'node:fs/promises';
const path = 'src/data/alkorea-snapshot.json';
const snapshot = JSON.parse(await readFile(path, 'utf8'));
for (const car of snapshot.cars) {
  if (car.mileage === 0) car.mileage = null;
  if (car.registeredMileage === 0) car.registeredMileage = null;
  if (car.title.endsWith(' —') && car.brand) car.title = car.brand;
  if (car.brand === 'Daechang Motors') { car.model = 'Potro Pickup S'; car.title = 'Daechang Motors Potro Pickup S'; }
}
await writeFile(path, JSON.stringify(snapshot));
console.log('Unknown source placeholder mileage and incomplete titles normalized');
