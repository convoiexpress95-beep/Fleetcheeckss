// Profile images for all vehicles
import renaultClioProfile from '@/assets/renault-clio-white.jpg';
import renaultMeganeProfile from '@/assets/renault-megane-profile.jpg';
import peugeot208Profile from '@/assets/peugeot-208-silver.jpg';
import peugeot308Profile from '@/assets/peugeot-308-profile.jpg';
import peugeot3008Profile from '@/assets/peugeot-3008-profile.jpg';
import citroenC3Profile from '@/assets/citroen-c3-blue.jpg';
import citroenC4Profile from '@/assets/citroen-c4-profile.jpg';
import vwPoloProfile from '@/assets/vw-polo-profile.jpg';
import vwGolfProfile from '@/assets/vw-golf-profile.jpg';
import vwId3Profile from '@/assets/vw-id3-profile.jpg';
import vwTiguanProfile from '@/assets/vw-tiguan-profile.jpg';
import audiA3Profile from '@/assets/audi-a3-profile.jpg';
import audiA4Profile from '@/assets/audi-a4-profile.jpg';
import audiQ5Profile from '@/assets/audi-q5-profile.jpg';
import bmwSerie1Profile from '@/assets/bmw-serie1-profile.jpg';
import bmwSerie3Profile from '@/assets/bmw-serie3-profile.jpg';
import mercedesClasseAProfile from '@/assets/mercedes-classe-a-profile.jpg';
import mercedesCProfile from '@/assets/mercedes-c-profile.jpg';
import mercedesGlaProfile from '@/assets/mercedes-gla-profile.jpg';
import fordFocusProfile from '@/assets/ford-focus-profile.jpg';
import fordTransitProfile from '@/assets/ford-transit-profile.jpg';
import hondaCivicProfile from '@/assets/honda-civic-profile.jpg';
import toyotaCorollaProfile from '@/assets/toyota-corolla-profile.jpg';
import toyotaRav4Profile from '@/assets/toyota-rav4-profile.jpg';
import hyundaiI30Profile from '@/assets/hyundai-i30-profile.jpg';
import nissanQashqaiProfile from '@/assets/nissan-qashqai-profile.jpg';
import peugeotExpertProfile from '@/assets/peugeot-expert-profile.jpg';
import renaultMasterProfile from '@/assets/renault-master-profile.jpg';
import renaultMasterNacelle from '@/assets/renault-master-nacelle-blue.jpg';
import fiatDucatoProfile from '@/assets/fiat-ducato-profile.jpg';
import ivecoDaily from '@/assets/iveco-daily-profile.jpg';
import mercedesActrosProfile from '@/assets/mercedes-actros-profile.jpg';
import volvoFHProfile from '@/assets/volvo-fh-profile.jpg';
import scaniaRProfile from '@/assets/scania-r-profile.jpg';
import dafXFProfile from '@/assets/daf-xf-profile.jpg';
import manTGXProfile from '@/assets/man-tgx-profile.jpg';
import ivecoStralisProfile from '@/assets/iveco-stralis-profile.jpg';
import renaultTrucksProfile from '@/assets/renault-trucks-profile.jpg';
import teslaModel3Profile from '@/assets/tesla-model3-profile.jpg';

export interface Vehicle {
  id: string;
  name: string;
  category: 'leger' | 'utilitaire' | 'poids_lourd';
  image: string;
  brand: string;
}

export const vehicles: Vehicle[] = [
  // ============= VEHICULES LEGERS =============
  
  // 🇫🇷 MARQUES FRANÇAISES - LEGER
  // Renault
  { id: '1', name: 'Renault Clio', category: 'leger', image: renaultClioProfile, brand: 'Renault' },
  { id: '2', name: 'Renault Mégane', category: 'leger', image: renaultMeganeProfile, brand: 'Renault' },
  { id: '3', name: 'Renault Mégane Estate', category: 'leger', image: renaultMeganeProfile, brand: 'Renault' },
  { id: '4', name: 'Renault Talisman', category: 'leger', image: renaultMeganeProfile, brand: 'Renault' },
  { id: '5', name: 'Renault Kadjar', category: 'leger', image: nissanQashqaiProfile, brand: 'Renault' },
  { id: '6', name: 'Renault Koleos', category: 'leger', image: nissanQashqaiProfile, brand: 'Renault' },
  { id: '7', name: 'Renault Captur', category: 'leger', image: nissanQashqaiProfile, brand: 'Renault' },
  { id: '8', name: 'Renault Scenic', category: 'leger', image: renaultMeganeProfile, brand: 'Renault' },

  // Peugeot
  { id: '9', name: 'Peugeot 208', category: 'leger', image: peugeot208Profile, brand: 'Peugeot' },
  { id: '10', name: 'Peugeot 308', category: 'leger', image: peugeot308Profile, brand: 'Peugeot' },
  { id: '11', name: 'Peugeot 308 SW', category: 'leger', image: peugeot308Profile, brand: 'Peugeot' },
  { id: '12', name: 'Peugeot 508', category: 'leger', image: peugeot308Profile, brand: 'Peugeot' },
  { id: '13', name: 'Peugeot 2008', category: 'leger', image: peugeot3008Profile, brand: 'Peugeot' },
  { id: '14', name: 'Peugeot 3008', category: 'leger', image: peugeot3008Profile, brand: 'Peugeot' },
  { id: '15', name: 'Peugeot 5008', category: 'leger', image: peugeot3008Profile, brand: 'Peugeot' },
  { id: '16', name: 'Peugeot 408', category: 'leger', image: peugeot308Profile, brand: 'Peugeot' },

  // Citroën
  { id: '17', name: 'Citroën C3', category: 'leger', image: citroenC3Profile, brand: 'Citroën' },
  { id: '18', name: 'Citroën C4', category: 'leger', image: citroenC4Profile, brand: 'Citroën' },
  { id: '19', name: 'Citroën C5 Aircross', category: 'leger', image: citroenC4Profile, brand: 'Citroën' },
  { id: '20', name: 'Citroën C3 Aircross', category: 'leger', image: citroenC3Profile, brand: 'Citroën' },
  { id: '21', name: 'Citroën Berlingo', category: 'leger', image: citroenC4Profile, brand: 'Citroën' },

  // DS Automobiles
  { id: '22', name: 'DS 3 Crossback', category: 'leger', image: citroenC3Profile, brand: 'DS' },
  { id: '23', name: 'DS 4', category: 'leger', image: citroenC4Profile, brand: 'DS' },
  { id: '24', name: 'DS 7 Crossback', category: 'leger', image: citroenC4Profile, brand: 'DS' },
  { id: '25', name: 'DS 9', category: 'leger', image: citroenC4Profile, brand: 'DS' },

  // Dacia
  { id: '26', name: 'Dacia Sandero', category: 'leger', image: renaultMeganeProfile, brand: 'Dacia' },
  { id: '27', name: 'Dacia Logan', category: 'leger', image: renaultMeganeProfile, brand: 'Dacia' },
  { id: '28', name: 'Dacia Duster', category: 'leger', image: nissanQashqaiProfile, brand: 'Dacia' },
  { id: '29', name: 'Dacia Spring', category: 'leger', image: renaultMeganeProfile, brand: 'Dacia' },

  // Alpine
  { id: '30', name: 'Alpine A110', category: 'leger', image: peugeot308Profile, brand: 'Alpine' },

  // 🇩🇪 MARQUES ALLEMANDES - LEGER
  // Volkswagen
  { id: '31', name: 'Volkswagen Polo', category: 'leger', image: vwPoloProfile, brand: 'Volkswagen' },
  { id: '32', name: 'Volkswagen Golf', category: 'leger', image: vwGolfProfile, brand: 'Volkswagen' },
  { id: '33', name: 'Volkswagen Jetta', category: 'leger', image: vwGolfProfile, brand: 'Volkswagen' },
  { id: '34', name: 'Volkswagen Passat', category: 'leger', image: vwGolfProfile, brand: 'Volkswagen' },
  { id: '35', name: 'Volkswagen T-Cross', category: 'leger', image: vwTiguanProfile, brand: 'Volkswagen' },
  { id: '36', name: 'Volkswagen T-Roc', category: 'leger', image: vwTiguanProfile, brand: 'Volkswagen' },
  { id: '37', name: 'Volkswagen Tiguan', category: 'leger', image: vwTiguanProfile, brand: 'Volkswagen' },
  { id: '38', name: 'Volkswagen Touareg', category: 'leger', image: vwTiguanProfile, brand: 'Volkswagen' },
  { id: '39', name: 'Volkswagen ID.3', category: 'leger', image: vwId3Profile, brand: 'Volkswagen' },
  { id: '40', name: 'Volkswagen ID.4', category: 'leger', image: vwId3Profile, brand: 'Volkswagen' },
  { id: '41', name: 'Volkswagen Up!', category: 'leger', image: vwPoloProfile, brand: 'Volkswagen' },
  { id: '42', name: 'Volkswagen Taigo', category: 'leger', image: vwTiguanProfile, brand: 'Volkswagen' },

  // Audi
  { id: '43', name: 'Audi A1', category: 'leger', image: audiA3Profile, brand: 'Audi' },
  { id: '44', name: 'Audi A3', category: 'leger', image: audiA3Profile, brand: 'Audi' },
  { id: '45', name: 'Audi A3 Sportback', category: 'leger', image: audiA3Profile, brand: 'Audi' },
  { id: '46', name: 'Audi A4', category: 'leger', image: audiA4Profile, brand: 'Audi' },
  { id: '47', name: 'Audi A4 Avant', category: 'leger', image: audiA4Profile, brand: 'Audi' },
  { id: '48', name: 'Audi A5 Coupé', category: 'leger', image: audiA4Profile, brand: 'Audi' },
  { id: '49', name: 'Audi A6', category: 'leger', image: audiA4Profile, brand: 'Audi' },
  { id: '50', name: 'Audi A6 Avant', category: 'leger', image: audiA4Profile, brand: 'Audi' },
  { id: '51', name: 'Audi A7 Sportback', category: 'leger', image: audiA4Profile, brand: 'Audi' },
  { id: '52', name: 'Audi A8', category: 'leger', image: audiA4Profile, brand: 'Audi' },
  { id: '53', name: 'Audi Q2', category: 'leger', image: audiQ5Profile, brand: 'Audi' },
  { id: '54', name: 'Audi Q3', category: 'leger', image: audiQ5Profile, brand: 'Audi' },
  { id: '55', name: 'Audi Q4 e-tron', category: 'leger', image: audiQ5Profile, brand: 'Audi' },
  { id: '56', name: 'Audi Q5', category: 'leger', image: audiQ5Profile, brand: 'Audi' },
  { id: '57', name: 'Audi Q7', category: 'leger', image: audiQ5Profile, brand: 'Audi' },
  { id: '58', name: 'Audi Q8', category: 'leger', image: audiQ5Profile, brand: 'Audi' },
  { id: '59', name: 'Audi TT', category: 'leger', image: audiA4Profile, brand: 'Audi' },
  { id: '60', name: 'Audi R8', category: 'leger', image: audiA4Profile, brand: 'Audi' },
  { id: '61', name: 'Audi e-tron GT', category: 'leger', image: audiA4Profile, brand: 'Audi' },

  // BMW
  { id: '62', name: 'BMW Série 1', category: 'leger', image: bmwSerie1Profile, brand: 'BMW' },
  { id: '63', name: 'BMW Série 2 Coupé', category: 'leger', image: bmwSerie1Profile, brand: 'BMW' },
  { id: '64', name: 'BMW Série 2 Active Tourer', category: 'leger', image: bmwSerie1Profile, brand: 'BMW' },
  { id: '65', name: 'BMW Série 3', category: 'leger', image: bmwSerie3Profile, brand: 'BMW' },
  { id: '66', name: 'BMW Série 3 Touring', category: 'leger', image: bmwSerie3Profile, brand: 'BMW' },
  { id: '67', name: 'BMW Série 4 Coupé', category: 'leger', image: bmwSerie3Profile, brand: 'BMW' },
  { id: '68', name: 'BMW Série 5', category: 'leger', image: bmwSerie3Profile, brand: 'BMW' },
  { id: '69', name: 'BMW Série 5 Touring', category: 'leger', image: bmwSerie3Profile, brand: 'BMW' },
  { id: '70', name: 'BMW Série 6 Gran Coupé', category: 'leger', image: bmwSerie3Profile, brand: 'BMW' },
  { id: '71', name: 'BMW Série 7', category: 'leger', image: bmwSerie3Profile, brand: 'BMW' },
  { id: '72', name: 'BMW X1', category: 'leger', image: audiQ5Profile, brand: 'BMW' },
  { id: '73', name: 'BMW X2', category: 'leger', image: audiQ5Profile, brand: 'BMW' },
  { id: '74', name: 'BMW X3', category: 'leger', image: audiQ5Profile, brand: 'BMW' },
  { id: '75', name: 'BMW X4', category: 'leger', image: audiQ5Profile, brand: 'BMW' },
  { id: '76', name: 'BMW X5', category: 'leger', image: audiQ5Profile, brand: 'BMW' },
  { id: '77', name: 'BMW X6', category: 'leger', image: audiQ5Profile, brand: 'BMW' },
  { id: '78', name: 'BMW X7', category: 'leger', image: audiQ5Profile, brand: 'BMW' },
  { id: '79', name: 'BMW iX', category: 'leger', image: audiQ5Profile, brand: 'BMW' },
  { id: '80', name: 'BMW i8', category: 'leger', image: bmwSerie3Profile, brand: 'BMW' },
  { id: '81', name: 'BMW M2', category: 'leger', image: bmwSerie3Profile, brand: 'BMW' },
  { id: '82', name: 'BMW M4', category: 'leger', image: bmwSerie3Profile, brand: 'BMW' },

  // Mercedes-Benz
  { id: '83', name: 'Mercedes Classe A', category: 'leger', image: mercedesClasseAProfile, brand: 'Mercedes-Benz' },
  { id: '84', name: 'Mercedes Classe A Break', category: 'leger', image: mercedesClasseAProfile, brand: 'Mercedes-Benz' },
  { id: '85', name: 'Mercedes Classe B', category: 'leger', image: mercedesClasseAProfile, brand: 'Mercedes-Benz' },
  { id: '86', name: 'Mercedes Classe C', category: 'leger', image: mercedesCProfile, brand: 'Mercedes-Benz' },
  { id: '87', name: 'Mercedes Classe C Break', category: 'leger', image: mercedesCProfile, brand: 'Mercedes-Benz' },
  { id: '88', name: 'Mercedes Classe C Coupé', category: 'leger', image: mercedesCProfile, brand: 'Mercedes-Benz' },
  { id: '89', name: 'Mercedes Classe E', category: 'leger', image: mercedesCProfile, brand: 'Mercedes-Benz' },
  { id: '90', name: 'Mercedes Classe E Break', category: 'leger', image: mercedesCProfile, brand: 'Mercedes-Benz' },
  { id: '91', name: 'Mercedes Classe E Coupé', category: 'leger', image: mercedesCProfile, brand: 'Mercedes-Benz' },
  { id: '92', name: 'Mercedes Classe S', category: 'leger', image: mercedesCProfile, brand: 'Mercedes-Benz' },
  { id: '93', name: 'Mercedes CLS', category: 'leger', image: mercedesCProfile, brand: 'Mercedes-Benz' },
  { id: '94', name: 'Mercedes GLA', category: 'leger', image: mercedesGlaProfile, brand: 'Mercedes-Benz' },
  { id: '95', name: 'Mercedes GLC', category: 'leger', image: mercedesGlaProfile, brand: 'Mercedes-Benz' },
  { id: '96', name: 'Mercedes GLE', category: 'leger', image: mercedesGlaProfile, brand: 'Mercedes-Benz' },
  { id: '97', name: 'Mercedes GLE Coupé', category: 'leger', image: mercedesGlaProfile, brand: 'Mercedes-Benz' },
  { id: '98', name: 'Mercedes GLS', category: 'leger', image: mercedesGlaProfile, brand: 'Mercedes-Benz' },
  { id: '99', name: 'Mercedes GLS AMG', category: 'leger', image: mercedesGlaProfile, brand: 'Mercedes-Benz' },
  { id: '100', name: 'Mercedes EQC', category: 'leger', image: mercedesGlaProfile, brand: 'Mercedes-Benz' },
  { id: '101', name: 'Mercedes AMG GT', category: 'leger', image: mercedesCProfile, brand: 'Mercedes-Benz' },
  { id: '102', name: 'Mercedes SL', category: 'leger', image: mercedesCProfile, brand: 'Mercedes-Benz' },

  // Opel
  { id: '103', name: 'Opel Corsa', category: 'leger', image: vwPoloProfile, brand: 'Opel' },
  { id: '104', name: 'Opel Astra', category: 'leger', image: vwGolfProfile, brand: 'Opel' },
  { id: '105', name: 'Opel Insignia', category: 'leger', image: audiA4Profile, brand: 'Opel' },
  { id: '106', name: 'Opel Crossland', category: 'leger', image: nissanQashqaiProfile, brand: 'Opel' },
  { id: '107', name: 'Opel Grandland', category: 'leger', image: nissanQashqaiProfile, brand: 'Opel' },

  // Porsche
  { id: '108', name: 'Porsche 911', category: 'leger', image: mercedesCProfile, brand: 'Porsche' },
  { id: '109', name: 'Porsche 718 Cayman', category: 'leger', image: mercedesCProfile, brand: 'Porsche' },
  { id: '110', name: 'Porsche 718 Boxster', category: 'leger', image: mercedesCProfile, brand: 'Porsche' },
  { id: '111', name: 'Porsche Macan', category: 'leger', image: audiQ5Profile, brand: 'Porsche' },
  { id: '112', name: 'Porsche Cayenne', category: 'leger', image: audiQ5Profile, brand: 'Porsche' },
  { id: '113', name: 'Porsche Panamera', category: 'leger', image: mercedesCProfile, brand: 'Porsche' },
  { id: '114', name: 'Porsche Taycan', category: 'leger', image: mercedesCProfile, brand: 'Porsche' },

  // 🇮🇹 MARQUES ITALIENNES - LEGER
  // Fiat
  { id: '115', name: 'Fiat 500', category: 'leger', image: vwPoloProfile, brand: 'Fiat' },
  { id: '116', name: 'Fiat Panda', category: 'leger', image: vwPoloProfile, brand: 'Fiat' },
  { id: '117', name: 'Fiat Punto', category: 'leger', image: vwPoloProfile, brand: 'Fiat' },
  { id: '118', name: 'Fiat Tipo', category: 'leger', image: vwGolfProfile, brand: 'Fiat' },

  // Alfa Romeo
  { id: '119', name: 'Alfa Romeo Giulietta', category: 'leger', image: vwGolfProfile, brand: 'Alfa Romeo' },
  { id: '120', name: 'Alfa Romeo Giulia', category: 'leger', image: bmwSerie3Profile, brand: 'Alfa Romeo' },
  { id: '121', name: 'Alfa Romeo Stelvio', category: 'leger', image: audiQ5Profile, brand: 'Alfa Romeo' },

  // Ferrari
  { id: '122', name: 'Ferrari 488', category: 'leger', image: mercedesCProfile, brand: 'Ferrari' },
  { id: '123', name: 'Ferrari F8', category: 'leger', image: mercedesCProfile, brand: 'Ferrari' },

  // Maserati
  { id: '124', name: 'Maserati Ghibli', category: 'leger', image: bmwSerie3Profile, brand: 'Maserati' },
  { id: '125', name: 'Maserati Quattroporte', category: 'leger', image: bmwSerie3Profile, brand: 'Maserati' },
  { id: '126', name: 'Maserati Levante', category: 'leger', image: audiQ5Profile, brand: 'Maserati' },

  // 🇪🇸 MARQUES ESPAGNOLES - LEGER
  // SEAT
  { id: '127', name: 'SEAT Ibiza', category: 'leger', image: vwPoloProfile, brand: 'SEAT' },
  { id: '128', name: 'SEAT Leon', category: 'leger', image: vwGolfProfile, brand: 'SEAT' },
  { id: '129', name: 'SEAT Leon ST', category: 'leger', image: vwGolfProfile, brand: 'SEAT' },
  { id: '130', name: 'SEAT Arona', category: 'leger', image: nissanQashqaiProfile, brand: 'SEAT' },
  { id: '131', name: 'SEAT Ateca', category: 'leger', image: nissanQashqaiProfile, brand: 'SEAT' },

  // Cupra
  { id: '132', name: 'Cupra Leon', category: 'leger', image: vwGolfProfile, brand: 'Cupra' },
  { id: '133', name: 'Cupra Ateca', category: 'leger', image: nissanQashqaiProfile, brand: 'Cupra' },
  { id: '134', name: 'Cupra Formentor', category: 'leger', image: nissanQashqaiProfile, brand: 'Cupra' },

  // 🇬🇧 MARQUES BRITANNIQUES - LEGER
  // Mini
  { id: '135', name: 'Mini Cooper', category: 'leger', image: vwPoloProfile, brand: 'Mini' },
  { id: '136', name: 'Mini Countryman', category: 'leger', image: nissanQashqaiProfile, brand: 'Mini' },
  { id: '137', name: 'Mini Clubman', category: 'leger', image: vwGolfProfile, brand: 'Mini' },

  // Jaguar
  { id: '138', name: 'Jaguar XE', category: 'leger', image: bmwSerie3Profile, brand: 'Jaguar' },
  { id: '139', name: 'Jaguar XF', category: 'leger', image: bmwSerie3Profile, brand: 'Jaguar' },
  { id: '140', name: 'Jaguar XJ', category: 'leger', image: bmwSerie3Profile, brand: 'Jaguar' },
  { id: '141', name: 'Jaguar F-Type', category: 'leger', image: mercedesCProfile, brand: 'Jaguar' },
  { id: '142', name: 'Jaguar E-Pace', category: 'leger', image: audiQ5Profile, brand: 'Jaguar' },
  { id: '143', name: 'Jaguar F-Pace', category: 'leger', image: audiQ5Profile, brand: 'Jaguar' },
  { id: '144', name: 'Jaguar I-Pace', category: 'leger', image: audiQ5Profile, brand: 'Jaguar' },

  // Land Rover
  { id: '145', name: 'Range Rover Evoque', category: 'leger', image: nissanQashqaiProfile, brand: 'Land Rover' },
  { id: '146', name: 'Range Rover Velar', category: 'leger', image: audiQ5Profile, brand: 'Land Rover' },
  { id: '147', name: 'Range Rover Sport', category: 'leger', image: audiQ5Profile, brand: 'Land Rover' },
  { id: '148', name: 'Range Rover Vogue', category: 'leger', image: audiQ5Profile, brand: 'Land Rover' },
  { id: '149', name: 'Discovery Sport', category: 'leger', image: audiQ5Profile, brand: 'Land Rover' },
  { id: '150', name: 'Discovery', category: 'leger', image: audiQ5Profile, brand: 'Land Rover' },

  // Aston Martin
  { id: '151', name: 'Aston Martin Vantage', category: 'leger', image: mercedesCProfile, brand: 'Aston Martin' },
  { id: '152', name: 'Aston Martin DB11', category: 'leger', image: mercedesCProfile, brand: 'Aston Martin' },

  // 🇸🇪 MARQUES SUEDOISES - LEGER
  // Volvo
  { id: '153', name: 'Volvo V40', category: 'leger', image: vwGolfProfile, brand: 'Volvo' },
  { id: '154', name: 'Volvo V60', category: 'leger', image: bmwSerie3Profile, brand: 'Volvo' },
  { id: '155', name: 'Volvo V90', category: 'leger', image: bmwSerie3Profile, brand: 'Volvo' },
  { id: '156', name: 'Volvo S60', category: 'leger', image: bmwSerie3Profile, brand: 'Volvo' },
  { id: '157', name: 'Volvo S90', category: 'leger', image: bmwSerie3Profile, brand: 'Volvo' },
  { id: '158', name: 'Volvo XC40', category: 'leger', image: nissanQashqaiProfile, brand: 'Volvo' },
  { id: '159', name: 'Volvo XC60', category: 'leger', image: audiQ5Profile, brand: 'Volvo' },
  { id: '160', name: 'Volvo XC90', category: 'leger', image: audiQ5Profile, brand: 'Volvo' },

  // 🇨🇿 MARQUES TCHEQUES - LEGER
  // Škoda
  { id: '161', name: 'Škoda Fabia', category: 'leger', image: vwPoloProfile, brand: 'Škoda' },
  { id: '162', name: 'Škoda Octavia', category: 'leger', image: vwGolfProfile, brand: 'Škoda' },
  { id: '163', name: 'Škoda Octavia Combi', category: 'leger', image: vwGolfProfile, brand: 'Škoda' },
  { id: '164', name: 'Škoda Superb', category: 'leger', image: bmwSerie3Profile, brand: 'Škoda' },
  { id: '165', name: 'Škoda Kamiq', category: 'leger', image: nissanQashqaiProfile, brand: 'Škoda' },
  { id: '166', name: 'Škoda Karoq', category: 'leger', image: nissanQashqaiProfile, brand: 'Škoda' },
  { id: '167', name: 'Škoda Kodiaq', category: 'leger', image: audiQ5Profile, brand: 'Škoda' },

  // 🇺🇸 MARQUES AMERICAINES - LEGER
  // Ford
  { id: '168', name: 'Ford Fiesta', category: 'leger', image: vwPoloProfile, brand: 'Ford' },
  { id: '169', name: 'Ford Focus', category: 'leger', image: fordFocusProfile, brand: 'Ford' },
  { id: '170', name: 'Ford Mondeo', category: 'leger', image: bmwSerie3Profile, brand: 'Ford' },
  { id: '171', name: 'Ford Kuga', category: 'leger', image: nissanQashqaiProfile, brand: 'Ford' },
  { id: '172', name: 'Ford Explorer', category: 'leger', image: audiQ5Profile, brand: 'Ford' },
  { id: '173', name: 'Ford Mustang', category: 'leger', image: mercedesCProfile, brand: 'Ford' },

  // Chevrolet
  { id: '174', name: 'Chevrolet Cruze', category: 'leger', image: vwGolfProfile, brand: 'Chevrolet' },
  { id: '175', name: 'Chevrolet Equinox', category: 'leger', image: nissanQashqaiProfile, brand: 'Chevrolet' },

  // Tesla
  { id: '176', name: 'Tesla Model 3', category: 'leger', image: teslaModel3Profile, brand: 'Tesla' },
  { id: '177', name: 'Tesla Model S', category: 'leger', image: teslaModel3Profile, brand: 'Tesla' },
  { id: '178', name: 'Tesla Model X', category: 'leger', image: audiQ5Profile, brand: 'Tesla' },
  { id: '179', name: 'Tesla Model Y', category: 'leger', image: audiQ5Profile, brand: 'Tesla' },

  // 🇯🇵 MARQUES JAPONAISES - LEGER
  // Toyota
  { id: '180', name: 'Toyota Yaris', category: 'leger', image: vwPoloProfile, brand: 'Toyota' },
  { id: '181', name: 'Toyota Corolla', category: 'leger', image: toyotaCorollaProfile, brand: 'Toyota' },
  { id: '182', name: 'Toyota Camry', category: 'leger', image: bmwSerie3Profile, brand: 'Toyota' },
  { id: '183', name: 'Toyota C-HR', category: 'leger', image: nissanQashqaiProfile, brand: 'Toyota' },
  { id: '184', name: 'Toyota RAV4', category: 'leger', image: toyotaRav4Profile, brand: 'Toyota' },
  { id: '185', name: 'Toyota Highlander', category: 'leger', image: audiQ5Profile, brand: 'Toyota' },
  { id: '186', name: 'Toyota Prius', category: 'leger', image: toyotaCorollaProfile, brand: 'Toyota' },

  // Honda
  { id: '187', name: 'Honda Jazz', category: 'leger', image: vwPoloProfile, brand: 'Honda' },
  { id: '188', name: 'Honda Civic', category: 'leger', image: hondaCivicProfile, brand: 'Honda' },
  { id: '189', name: 'Honda Accord', category: 'leger', image: bmwSerie3Profile, brand: 'Honda' },
  { id: '190', name: 'Honda HR-V', category: 'leger', image: nissanQashqaiProfile, brand: 'Honda' },
  { id: '191', name: 'Honda CR-V', category: 'leger', image: nissanQashqaiProfile, brand: 'Honda' },

  // Nissan
  { id: '192', name: 'Nissan Micra', category: 'leger', image: vwPoloProfile, brand: 'Nissan' },
  { id: '193', name: 'Nissan Leaf', category: 'leger', image: vwGolfProfile, brand: 'Nissan' },
  { id: '194', name: 'Nissan Qashqai', category: 'leger', image: nissanQashqaiProfile, brand: 'Nissan' },
  { id: '195', name: 'Nissan X-Trail', category: 'leger', image: audiQ5Profile, brand: 'Nissan' },
  { id: '196', name: 'Nissan Juke', category: 'leger', image: nissanQashqaiProfile, brand: 'Nissan' },

  // Mazda
  { id: '197', name: 'Mazda 2', category: 'leger', image: vwPoloProfile, brand: 'Mazda' },
  { id: '198', name: 'Mazda 3', category: 'leger', image: vwGolfProfile, brand: 'Mazda' },
  { id: '199', name: 'Mazda 6', category: 'leger', image: bmwSerie3Profile, brand: 'Mazda' },
  { id: '200', name: 'Mazda CX-3', category: 'leger', image: nissanQashqaiProfile, brand: 'Mazda' },
  { id: '201', name: 'Mazda CX-5', category: 'leger', image: nissanQashqaiProfile, brand: 'Mazda' },
  { id: '202', name: 'Mazda MX-5', category: 'leger', image: mercedesCProfile, brand: 'Mazda' },

  // Subaru
  { id: '203', name: 'Subaru Impreza', category: 'leger', image: vwGolfProfile, brand: 'Subaru' },
  { id: '204', name: 'Subaru Outback', category: 'leger', image: audiQ5Profile, brand: 'Subaru' },
  { id: '205', name: 'Subaru Forester', category: 'leger', image: audiQ5Profile, brand: 'Subaru' },

  // Lexus
  { id: '206', name: 'Lexus IS', category: 'leger', image: bmwSerie3Profile, brand: 'Lexus' },
  { id: '207', name: 'Lexus ES', category: 'leger', image: bmwSerie3Profile, brand: 'Lexus' },
  { id: '208', name: 'Lexus LS', category: 'leger', image: bmwSerie3Profile, brand: 'Lexus' },
  { id: '209', name: 'Lexus NX', category: 'leger', image: audiQ5Profile, brand: 'Lexus' },
  { id: '210', name: 'Lexus RX', category: 'leger', image: audiQ5Profile, brand: 'Lexus' },
  { id: '211', name: 'Lexus LX', category: 'leger', image: audiQ5Profile, brand: 'Lexus' },

  // 🇰🇷 MARQUES COREENNES - LEGER
  // Hyundai
  { id: '212', name: 'Hyundai i10', category: 'leger', image: vwPoloProfile, brand: 'Hyundai' },
  { id: '213', name: 'Hyundai i20', category: 'leger', image: vwPoloProfile, brand: 'Hyundai' },
  { id: '214', name: 'Hyundai i30', category: 'leger', image: hyundaiI30Profile, brand: 'Hyundai' },
  { id: '215', name: 'Hyundai Elantra', category: 'leger', image: bmwSerie3Profile, brand: 'Hyundai' },
  { id: '216', name: 'Hyundai Kona', category: 'leger', image: nissanQashqaiProfile, brand: 'Hyundai' },
  { id: '217', name: 'Hyundai Tucson', category: 'leger', image: nissanQashqaiProfile, brand: 'Hyundai' },
  { id: '218', name: 'Hyundai Santa Fe', category: 'leger', image: audiQ5Profile, brand: 'Hyundai' },

  // Kia
  { id: '219', name: 'Kia Picanto', category: 'leger', image: vwPoloProfile, brand: 'Kia' },
  { id: '220', name: 'Kia Rio', category: 'leger', image: vwPoloProfile, brand: 'Kia' },
  { id: '221', name: 'Kia Ceed', category: 'leger', image: vwGolfProfile, brand: 'Kia' },
  { id: '222', name: 'Kia Forte', category: 'leger', image: bmwSerie3Profile, brand: 'Kia' },
  { id: '223', name: 'Kia Stonic', category: 'leger', image: nissanQashqaiProfile, brand: 'Kia' },
  { id: '224', name: 'Kia Sportage', category: 'leger', image: nissanQashqaiProfile, brand: 'Kia' },
  { id: '225', name: 'Kia Sorento', category: 'leger', image: audiQ5Profile, brand: 'Kia' },
  { id: '226', name: 'Kia EV6', category: 'leger', image: audiQ5Profile, brand: 'Kia' },

  // 🇨🇳 MARQUES CHINOISES - LEGER
  // MG
  { id: '227', name: 'MG ZS EV', category: 'leger', image: nissanQashqaiProfile, brand: 'MG' },
  { id: '228', name: 'MG 5 EV', category: 'leger', image: vwGolfProfile, brand: 'MG' },
  { id: '229', name: 'MG HS', category: 'leger', image: nissanQashqaiProfile, brand: 'MG' },

  // BYD
  { id: '230', name: 'BYD Atto 3', category: 'leger', image: nissanQashqaiProfile, brand: 'BYD' },

  // ============= VEHICULES UTILITAIRES =============
  
  // 🇫🇷 MARQUES FRANÇAISES - UTILITAIRE
  // Renault
  { id: '231', name: 'Renault Kangoo', category: 'utilitaire', image: peugeotExpertProfile, brand: 'Renault' },
  { id: '232', name: 'Renault Trafic', category: 'utilitaire', image: renaultMasterProfile, brand: 'Renault' },
  { id: '233', name: 'Renault Master', category: 'utilitaire', image: renaultMasterProfile, brand: 'Renault' },
  { id: '234', name: 'Renault Master Nacelle', category: 'utilitaire', image: renaultMasterNacelle, brand: 'Renault' },
  { id: '235', name: 'Renault Alaskan', category: 'utilitaire', image: peugeotExpertProfile, brand: 'Renault' },

  // Peugeot
  { id: '236', name: 'Peugeot Partner', category: 'utilitaire', image: peugeotExpertProfile, brand: 'Peugeot' },
  { id: '237', name: 'Peugeot Expert', category: 'utilitaire', image: peugeotExpertProfile, brand: 'Peugeot' },
  { id: '238', name: 'Peugeot Boxer', category: 'utilitaire', image: fiatDucatoProfile, brand: 'Peugeot' },
  { id: '239', name: 'Peugeot Traveller', category: 'utilitaire', image: peugeotExpertProfile, brand: 'Peugeot' },

  // Citroën
  { id: '240', name: 'Citroën Berlingo', category: 'utilitaire', image: peugeotExpertProfile, brand: 'Citroën' },
  { id: '241', name: 'Citroën Jumpy', category: 'utilitaire', image: peugeotExpertProfile, brand: 'Citroën' },
  { id: '242', name: 'Citroën Jumper', category: 'utilitaire', image: fiatDucatoProfile, brand: 'Citroën' },

  // 🇩🇪 MARQUES ALLEMANDES - UTILITAIRE
  // Volkswagen
  { id: '243', name: 'Volkswagen Caddy', category: 'utilitaire', image: peugeotExpertProfile, brand: 'Volkswagen' },
  { id: '244', name: 'Volkswagen Transporter', category: 'utilitaire', image: renaultMasterProfile, brand: 'Volkswagen' },
  { id: '245', name: 'Volkswagen Crafter', category: 'utilitaire', image: fiatDucatoProfile, brand: 'Volkswagen' },
  { id: '246', name: 'Volkswagen Amarok', category: 'utilitaire', image: peugeotExpertProfile, brand: 'Volkswagen' },

  // Mercedes-Benz
  { id: '247', name: 'Mercedes Citan', category: 'utilitaire', image: peugeotExpertProfile, brand: 'Mercedes-Benz' },
  { id: '248', name: 'Mercedes Vito', category: 'utilitaire', image: renaultMasterProfile, brand: 'Mercedes-Benz' },
  { id: '249', name: 'Mercedes Sprinter', category: 'utilitaire', image: fiatDucatoProfile, brand: 'Mercedes-Benz' },
  { id: '250', name: 'Mercedes Classe X', category: 'utilitaire', image: peugeotExpertProfile, brand: 'Mercedes-Benz' },

  // 🇮🇹 MARQUES ITALIENNES - UTILITAIRE
  // Fiat
  { id: '251', name: 'Fiat Fiorino', category: 'utilitaire', image: peugeotExpertProfile, brand: 'Fiat' },
  { id: '252', name: 'Fiat Talento', category: 'utilitaire', image: renaultMasterProfile, brand: 'Fiat' },
  { id: '253', name: 'Fiat Ducato', category: 'utilitaire', image: fiatDucatoProfile, brand: 'Fiat' },

  // Iveco
  { id: '254', name: 'Iveco Daily', category: 'utilitaire', image: ivecoDaily, brand: 'Iveco' },
  { id: '255', name: 'Iveco Daily Plateau', category: 'utilitaire', image: ivecoDaily, brand: 'Iveco' },

  // 🇺🇸 MARQUES AMERICAINES - UTILITAIRE
  // Ford
  { id: '256', name: 'Ford Transit Connect', category: 'utilitaire', image: peugeotExpertProfile, brand: 'Ford' },
  { id: '257', name: 'Ford Transit Custom', category: 'utilitaire', image: fordTransitProfile, brand: 'Ford' },
  { id: '258', name: 'Ford Transit', category: 'utilitaire', image: fordTransitProfile, brand: 'Ford' },
  { id: '259', name: 'Ford Ranger', category: 'utilitaire', image: peugeotExpertProfile, brand: 'Ford' },

  // 🇯🇵 MARQUES JAPONAISES - UTILITAIRE
  // Toyota
  { id: '260', name: 'Toyota Proace', category: 'utilitaire', image: peugeotExpertProfile, brand: 'Toyota' },
  { id: '261', name: 'Toyota Hiace', category: 'utilitaire', image: renaultMasterProfile, brand: 'Toyota' },
  { id: '262', name: 'Toyota Hilux', category: 'utilitaire', image: peugeotExpertProfile, brand: 'Toyota' },

  // Nissan
  { id: '263', name: 'Nissan NV200', category: 'utilitaire', image: peugeotExpertProfile, brand: 'Nissan' },
  { id: '264', name: 'Nissan NV300', category: 'utilitaire', image: renaultMasterProfile, brand: 'Nissan' },
  { id: '265', name: 'Nissan NV400', category: 'utilitaire', image: fiatDucatoProfile, brand: 'Nissan' },

  // 🇩🇪 MARQUES ALLEMANDES - UTILITAIRE
  // Opel
  { id: '266', name: 'Opel Combo', category: 'utilitaire', image: peugeotExpertProfile, brand: 'Opel' },
  { id: '267', name: 'Opel Vivaro', category: 'utilitaire', image: renaultMasterProfile, brand: 'Opel' },
  { id: '268', name: 'Opel Movano', category: 'utilitaire', image: fiatDucatoProfile, brand: 'Opel' },

  // 🇰🇷 MARQUES COREENNES - UTILITAIRE
  // Hyundai
  { id: '269', name: 'Hyundai H350', category: 'utilitaire', image: renaultMasterProfile, brand: 'Hyundai' },
  { id: '270', name: 'Hyundai Porter', category: 'utilitaire', image: ivecoDaily, brand: 'Hyundai' },

  // Kia
  { id: '271', name: 'Kia K2500', category: 'utilitaire', image: ivecoDaily, brand: 'Kia' },

  // 🇯🇵 MARQUES JAPONAISES - UTILITAIRE (suite)
  // Isuzu
  { id: '272', name: 'Isuzu D-Max', category: 'utilitaire', image: peugeotExpertProfile, brand: 'Isuzu' },

  // ============= VEHICULES POIDS LOURDS =============
  
  // 🇩🇪 MARQUES ALLEMANDES - POIDS LOURD
  // Mercedes-Benz
  { id: '273', name: 'Mercedes Actros', category: 'poids_lourd', image: mercedesActrosProfile, brand: 'Mercedes-Benz' },
  { id: '274', name: 'Mercedes Antos', category: 'poids_lourd', image: mercedesActrosProfile, brand: 'Mercedes-Benz' },
  { id: '275', name: 'Mercedes Arocs', category: 'poids_lourd', image: mercedesActrosProfile, brand: 'Mercedes-Benz' },
  { id: '276', name: 'Mercedes Atego', category: 'poids_lourd', image: mercedesActrosProfile, brand: 'Mercedes-Benz' },

  // MAN
  { id: '277', name: 'MAN TGX', category: 'poids_lourd', image: manTGXProfile, brand: 'MAN' },
  { id: '278', name: 'MAN TGS', category: 'poids_lourd', image: manTGXProfile, brand: 'MAN' },
  { id: '279', name: 'MAN TGM', category: 'poids_lourd', image: manTGXProfile, brand: 'MAN' },
  { id: '280', name: 'MAN TGL', category: 'poids_lourd', image: manTGXProfile, brand: 'MAN' },

  // 🇸🇪 MARQUES SUEDOISES - POIDS LOURD
  // Scania
  { id: '281', name: 'Scania R-Series', category: 'poids_lourd', image: scaniaRProfile, brand: 'Scania' },
  { id: '282', name: 'Scania S-Series', category: 'poids_lourd', image: scaniaRProfile, brand: 'Scania' },
  { id: '283', name: 'Scania P-Series', category: 'poids_lourd', image: scaniaRProfile, brand: 'Scania' },
  { id: '284', name: 'Scania G-Series', category: 'poids_lourd', image: scaniaRProfile, brand: 'Scania' },
  { id: '285', name: 'Scania L-Series', category: 'poids_lourd', image: scaniaRProfile, brand: 'Scania' },

  // Volvo
  { id: '286', name: 'Volvo FH', category: 'poids_lourd', image: volvoFHProfile, brand: 'Volvo' },
  { id: '287', name: 'Volvo FM', category: 'poids_lourd', image: volvoFHProfile, brand: 'Volvo' },
  { id: '288', name: 'Volvo FE', category: 'poids_lourd', image: volvoFHProfile, brand: 'Volvo' },
  { id: '289', name: 'Volvo FL', category: 'poids_lourd', image: volvoFHProfile, brand: 'Volvo' },

  // 🇳🇱 MARQUES NEERLANDAISES - POIDS LOURD
  // DAF
  { id: '290', name: 'DAF XF', category: 'poids_lourd', image: dafXFProfile, brand: 'DAF' },
  { id: '291', name: 'DAF CF', category: 'poids_lourd', image: dafXFProfile, brand: 'DAF' },
  { id: '292', name: 'DAF LF', category: 'poids_lourd', image: dafXFProfile, brand: 'DAF' },

  // 🇮🇹 MARQUES ITALIENNES - POIDS LOURD
  // Iveco
  { id: '293', name: 'Iveco Stralis', category: 'poids_lourd', image: ivecoStralisProfile, brand: 'Iveco' },
  { id: '294', name: 'Iveco S-Way', category: 'poids_lourd', image: ivecoStralisProfile, brand: 'Iveco' },
  { id: '295', name: 'Iveco Eurocargo', category: 'poids_lourd', image: ivecoStralisProfile, brand: 'Iveco' },

  // 🇫🇷 MARQUES FRANÇAISES - POIDS LOURD
  // Renault Trucks
  { id: '296', name: 'Renault Trucks T', category: 'poids_lourd', image: renaultTrucksProfile, brand: 'Renault Trucks' },
  { id: '297', name: 'Renault Trucks C', category: 'poids_lourd', image: renaultTrucksProfile, brand: 'Renault Trucks' },
  { id: '298', name: 'Renault Trucks K', category: 'poids_lourd', image: renaultTrucksProfile, brand: 'Renault Trucks' },
  { id: '299', name: 'Renault Trucks D', category: 'poids_lourd', image: renaultTrucksProfile, brand: 'Renault Trucks' },

  // 🇯🇵 MARQUES JAPONAISES - POIDS LOURD
  // Mitsubishi
  { id: '300', name: 'Mitsubishi Fuso Canter', category: 'poids_lourd', image: ivecoStralisProfile, brand: 'Mitsubishi' },

  // Isuzu
  { id: '301', name: 'Isuzu NPR', category: 'poids_lourd', image: ivecoStralisProfile, brand: 'Isuzu' },

  // Hino
  { id: '302', name: 'Hino 300', category: 'poids_lourd', image: ivecoStralisProfile, brand: 'Hino' },
  { id: '303', name: 'Hino 500', category: 'poids_lourd', image: ivecoStralisProfile, brand: 'Hino' },

  // 🇮🇳 MARQUES INDIENNES - POIDS LOURD
  // Tata
  { id: '304', name: 'Tata Prima', category: 'poids_lourd', image: ivecoStralisProfile, brand: 'Tata' },

  // BharatBenz
  { id: '305', name: 'BharatBenz 2528C', category: 'poids_lourd', image: mercedesActrosProfile, brand: 'BharatBenz' },

  // 🇯🇵 UD Trucks (anciennement Nissan Diesel) - POIDS LOURD
  // UD Trucks
  { id: '306', name: 'UD Trucks Quon', category: 'poids_lourd', image: volvoFHProfile, brand: 'UD Trucks' },

  // 🇺🇸 MARQUES AMERICAINES - POIDS LOURD
  // Freightliner
  { id: '307', name: 'Freightliner Cascadia', category: 'poids_lourd', image: volvoFHProfile, brand: 'Freightliner' },

  // Peterbilt
  { id: '308', name: 'Peterbilt 579', category: 'poids_lourd', image: volvoFHProfile, brand: 'Peterbilt' },

  // Kenworth
  { id: '309', name: 'Kenworth T680', category: 'poids_lourd', image: volvoFHProfile, brand: 'Kenworth' },

  // Mack
  { id: '310', name: 'Mack Anthem', category: 'poids_lourd', image: volvoFHProfile, brand: 'Mack' },

  // Western Star
  { id: '311', name: 'Western Star 5700XE', category: 'poids_lourd', image: volvoFHProfile, brand: 'Western Star' }
];

export const getVehiclesByBrand = (brand: string) => {
  return vehicles.filter(vehicle => vehicle.brand === brand);
};

export const getVehiclesByCategory = (category: Vehicle['category']) => {
  return vehicles.filter(vehicle => vehicle.category === category);
};

export const findVehicleByName = (name: string) => {
  return vehicles.find(vehicle => vehicle.name === name);
};

export const getAllBrands = () => {
  const brands = Array.from(new Set(vehicles.map(vehicle => vehicle.brand)));
  const sortOrder = [
    'Renault', 'Peugeot', 'Citroën', 'DS', 'Dacia', 'Alpine',
    'Volkswagen', 'Audi', 'BMW', 'Mercedes-Benz', 'Opel', 'Porsche',
    'Fiat', 'Alfa Romeo', 'Ferrari', 'Maserati',
    'SEAT', 'Cupra',
    'Mini', 'Jaguar', 'Land Rover', 'Aston Martin',
    'Volvo', 'Škoda',
    'Ford', 'Chevrolet', 'Tesla',
    'Toyota', 'Honda', 'Nissan', 'Mazda', 'Subaru', 'Lexus',
    'Hyundai', 'Kia',
    'MG', 'BYD'
  ];
  
  return brands.sort((a, b) => {
    const aIndex = sortOrder.indexOf(a);
    const bIndex = sortOrder.indexOf(b);
    
    if (aIndex === -1 && bIndex === -1) return 0;
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    
    return aIndex - bIndex;
  });
};

export const getVehiclesSortedByBrand = () => {
  const sortOrder = [
    'Renault', 'Peugeot', 'Citroën', 'DS', 'Dacia', 'Alpine',
    'Volkswagen', 'Audi', 'BMW', 'Mercedes-Benz', 'Opel', 'Porsche',
    'Fiat', 'Alfa Romeo', 'Ferrari', 'Maserati',
    'SEAT', 'Cupra',
    'Mini', 'Jaguar', 'Land Rover', 'Aston Martin',
    'Volvo', 'Škoda',
    'Ford', 'Chevrolet', 'Tesla',
    'Toyota', 'Honda', 'Nissan', 'Mazda', 'Subaru', 'Lexus',
    'Hyundai', 'Kia',
    'MG', 'BYD'
  ];

  return vehicles.sort((a, b) => {
    const aIndex = sortOrder.indexOf(a.brand);
    const bIndex = sortOrder.indexOf(b.brand);
    
    if (aIndex === -1 && bIndex === -1) return 0;
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    
    return aIndex - bIndex;
  });
};