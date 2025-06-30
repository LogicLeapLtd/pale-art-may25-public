import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function applyArtworkUpdates() {
  console.log('Starting artwork updates...')
  let successCount = 0
  let errorCount = 0
  const errors: string[] = []

  const updates = [
    // Update: Man Mowing (ID: aa5937be-4666-41e4-9e16-4617b6bc8ec3)
    { id: 'aa5937be-4666-41e4-9e16-4617b6bc8ec3', artist: 'WILL ROBERTS', price: '4636.80', dimensions: '49 x 39 cm' },
    
    // Update: Phyllis at Creswell Quay, Pembs (ID: 0fe1ee18-0d84-4b8c-83ad-5fa5f3e1b999)
    { id: '0fe1ee18-0d84-4b8c-83ad-5fa5f3e1b999', artist: 'WILL ROBERTS', price: '5152.00', dimensions: '59 x 75 cm' },
    
    // Update: Children on the Beach (ID: 6e12b1bb-cc8a-4797-aa26-540bca403e79)
    { id: '6e12b1bb-cc8a-4797-aa26-540bca403e79', price: '8243.20', dimensions: '45 x 90 cm' },
    
    // Update: Locks (ID: 07882d9d-65e8-457f-9958-61530e72098a)
    { id: '07882d9d-65e8-457f-9958-61530e72098a', price: '18000.00', dimensions: '90.5 x 75 cm' },
    
    // Update: Poet Dylan Thomas (ID: ea980382-218f-46c5-9fdd-36bb8277906e)
    { id: 'ea980382-218f-46c5-9fdd-36bb8277906e', artist: 'HUGH OLOFF DE WET', price: '3000.00', dimensions: 'Cubic Black Marble Base, 10.4 cm high' },
    
    // Update: News Please (ID: 54c10841-60f4-4ee1-bec0-b6b1e0421b05)
    { id: '54c10841-60f4-4ee1-bec0-b6b1e0421b05', price: '2500.00', dimensions: '85 x 75 cm' },
    
    // Update: Earth Vs.Venus (ID: 443b2c5a-2dfe-46a0-8b4f-b8df158894aa)
    { id: '443b2c5a-2dfe-46a0-8b4f-b8df158894aa', price: '1900.00', dimensions: '180 x 84 cm' },
    
    // Update: Playing Recorders (ID: 603a9a6a-5fd1-4921-aaab-cbbfbf7583cc)
    { id: '603a9a6a-5fd1-4921-aaab-cbbfbf7583cc', price: '3000.00', dimensions: '59.5 x 38.5 cm' },
    
    // Update: Penarth Pier (ID: 55d3c610-0499-4c06-a073-eb1044fccec5)
    { id: '55d3c610-0499-4c06-a073-eb1044fccec5', price: '2200.00', dimensions: '46 x 61 cm' },
    
    // Update: Autumnal Landscape (ID: 3be9fd8a-0d61-4a7e-ac8f-53e20b5422ec)
    { id: '3be9fd8a-0d61-4a7e-ac8f-53e20b5422ec', artist: 'JOHN ELWYN', price: '6000.00', dimensions: '39 x 49 cm' },
    
    // Update: Flowers, Lupins (ID: 53a6f17f-9455-471b-a09b-3a5c3d7cd62c)
    { id: '53a6f17f-9455-471b-a09b-3a5c3d7cd62c', price: '2576.00', dimensions: '59 x 50 cm' },
    
    // Update: Early Still-Life, Wine and Flowers (ID: 8b356d4c-5cfd-4074-8ca3-9ea155fdc8f9)
    { id: '8b356d4c-5cfd-4074-8ca3-9ea155fdc8f9', artist: 'JOHN ELWYN', price: '4121.60', dimensions: '49 x 74 cm' },
    
    // Update: The Blue Sunflower (ID: e9a58d56-e62c-4a0b-bcbc-c8024cde6c11)
    { id: 'e9a58d56-e62c-4a0b-bcbc-c8024cde6c11', price: '3864.00', dimensions: '60 x 60 cm' },
    
    // Update: Cow and Farm Hopper (ID: 45754564-2711-4d2d-a818-9fdc4b61a438)
    { id: '45754564-2711-4d2d-a818-9fdc4b61a438', artist: 'WILL ROBERTS', price: '4894.40', dimensions: '29 x 39 cm' },
    
    // Update: Windswept Landscape with Cottage (ID: 12d8ef98-4540-4240-ba61-527fe7006e0d)
    { id: '12d8ef98-4540-4240-ba61-527fe7006e0d', artist: 'MEGAN JONES', price: '980.00', dimensions: '50 x 36 cm' },
    
    // Update: The Village and I and Marc Chagall (ID: deaf7df6-0405-4855-84a2-0f2103bd19ef)
    { id: 'deaf7df6-0405-4855-84a2-0f2103bd19ef', price: '500.00', dimensions: '89 x 89 cm' },
    
    // Update: Cockle Pickers (ID: 44ae05c9-6054-49c4-b4c2-e68d956d2885)
    { id: '44ae05c9-6054-49c4-b4c2-e68d956d2885', price: '1000.00', dimensions: '35 x 49 cm' },
    
    // Update: Coracler (ID: 66083857-29b3-4a94-b393-d832080dfc94)
    { id: '66083857-29b3-4a94-b393-d832080dfc94', price: '1200.00', dimensions: '35 x 49 cm' },
    
    // Update: Moelfre (ID: 5e00873b-15ed-48be-ade1-7348b0617d09)
    { id: '5e00873b-15ed-48be-ade1-7348b0617d09', price: '1200.00', dimensions: '35 x 49 cm' },
    
    // Update: The Race (ID: f091381a-2f86-4745-83c2-c545c549de9c)
    { id: 'f091381a-2f86-4745-83c2-c545c549de9c', price: '950.00', dimensions: '70 x 42 cm' },
    
    // Update: Autumnal Landscape with Trees (ID: e56f63be-0691-4f10-9679-2fc5aaa89ac8)
    { id: 'e56f63be-0691-4f10-9679-2fc5aaa89ac8', artist: 'JOSIAH CLINTON JONES', price: '560.00', dimensions: '36.5 x 44 cm' },
    
    // Update: Killjoy (ID: b5476db6-37f8-48c4-ae1c-c91e205a9b9c)
    { id: 'b5476db6-37f8-48c4-ae1c-c91e205a9b9c', price: '600.00', dimensions: '59 x 69 cm' },
    
    // Update: Snowdon from Llyn Mymbr (ID: 1e96fcfb-85b2-42d0-b2be-70957f021fce)
    { id: '1e96fcfb-85b2-42d0-b2be-70957f021fce', price: '780.00', dimensions: '28 x 75 cm' },
    
    // Update: The River Gwyrfai (ID: fee6b849-a551-4d63-a379-c2e94c44f15a)
    { id: 'fee6b849-a551-4d63-a379-c2e94c44f15a', price: '950.00', dimensions: '23.5 x 54 cm' },
    
    // Update: Standing Shepherd (ID: 6ea6d907-4898-4024-911e-bb071d8c684b)
    { id: '6ea6d907-4898-4024-911e-bb071d8c684b', price: '4600.00', dimensions: '73 x 54 cm' },
    
    // Update: Cutting Images (ID: d4e26bd2-e440-4c13-a3f2-d70a543651ed)
    { id: 'd4e26bd2-e440-4c13-a3f2-d70a543651ed', price: '5800.00', dimensions: 'Varies' },
    
    // Update: Horses at Lle Cul (ID: f747a159-fed8-41d6-bb0b-c2778784717d)
    { id: 'f747a159-fed8-41d6-bb0b-c2778784717d', artist: 'SIR KYFFIN WILLIAMS RA', price: '670.00', dimensions: '49 x 48 cm' },
    
    // Update: Ponies, Anglesey (ID: 0d08f89e-f099-4a5f-9957-9255dce3c39e)
    { id: '0d08f89e-f099-4a5f-9957-9255dce3c39e', price: '1500.00', dimensions: '35 x 45.5 cm' },
    
    // Update: Welsh Black Bull (ID: 564b2f04-767b-4b25-9d5b-1444f2c020ef)
    { id: '564b2f04-767b-4b25-9d5b-1444f2c020ef', artist: 'SIR KYFFIN WILLIAMS RA', price: '2500.00', dimensions: '40 x 61 cm' },
    
    // Update: Pontllyfni in Snow (ID: 3bf0f3ef-8a3c-41fe-af36-1fb84001a842)
    { id: '3bf0f3ef-8a3c-41fe-af36-1fb84001a842', price: '3800.00', dimensions: '44 x 75 cm' },
    
    // Update: Farmer in Overcoat with Walking Stick (ID: 0859a9eb-e854-4b86-b7c3-8ef4280d2a83)
    { id: '0859a9eb-e854-4b86-b7c3-8ef4280d2a83', artist: 'SIR KYFFIN WILLIAMS RA', price: '10800.00', dimensions: '35 x 24 cm' },
    
    // Update: Farmer with Walking Stick (ID: ad51088d-0346-4f2f-b85c-60e02adf1795)
    { id: 'ad51088d-0346-4f2f-b85c-60e02adf1795', artist: 'SIR KYFFIN WILLIAMS RA', price: '20000.00', dimensions: '49 x 39 cm' },
    
    // Update: Road to the Mine, Blaenau Ffestiniog (ID: 0208d143-668c-461c-8772-dd2526f3a36d)
    { id: '0208d143-668c-461c-8772-dd2526f3a36d', price: '70000.00', dimensions: '60 x 50 cm' },
    
    // Update: Anglesey in Winter (ID: 66a5c130-39af-490b-bf65-36e9d7b70144)
    { id: '66a5c130-39af-490b-bf65-36e9d7b70144', price: '100000.00', dimensions: '77 x 126 cm' },
    
    // Update: Llyn-y-Fan Fach (ID: c35a832a-1b1a-4834-b1f8-2ee448339218)
    { id: 'c35a832a-1b1a-4834-b1f8-2ee448339218', price: '1200.00', dimensions: '46 x 76 cm' },
    
    // Update: Fishing Boats, Marina (ID: 36e1d0ae-b120-41e1-994b-c9dc3932cc46)
    { id: '36e1d0ae-b120-41e1-994b-c9dc3932cc46', artist: 'MIKE JONES', price: '1200.00', dimensions: '48 x 57 cm' },
    
    // Update: Misty Flooded Moorland (ID: 62d27350-c739-4c8d-a3f0-a9039217ac85)
    { id: '62d27350-c739-4c8d-a3f0-a9039217ac85', artist: 'GARETH THOMAS', price: '1200.00', dimensions: '18 x 61 cm' },
    
    // Update: Llanfachraeth (ID: af736f8f-4a88-4469-83a3-e0dd6d31ff81)
    { id: 'af736f8f-4a88-4469-83a3-e0dd6d31ff81', price: '2000.00', dimensions: '24 x 57 cm' },
    
    // Update: Still Life with Olives (ID: acfa0719-5cb4-4c5d-9b81-5ee5f38f4501)
    { id: 'acfa0719-5cb4-4c5d-9b81-5ee5f38f4501', price: '2300.00', dimensions: '50 x 40 cm' },
    
    // Update: Figure at Doorway with Garden (ID: d7fc9b66-8d8b-444e-9db6-1f4e6a031f99)
    { id: 'd7fc9b66-8d8b-444e-9db6-1f4e6a031f99', artist: 'JOHN ELWYN', price: '2000.00', dimensions: '32 x 49 cm' },
    
    // Update: Hon (ID: 61e6820d-9787-4bd1-b4c6-7d7f0b74fb02)
    { id: '61e6820d-9787-4bd1-b4c6-7d7f0b74fb02', price: '7200.00', dimensions: '77 x 58 cm' },
    
    // Update: Landscape Series No.37 (ID: 95321d54-8a48-40d3-8e72-c92dca9b6583)
    { id: '95321d54-8a48-40d3-8e72-c92dca9b6583', artist: 'ROGER CECIL', price: '1600.00', dimensions: '53 x 48 cm' },
    
    // Update: Colourful Study of Figure on Mule (ID: 910f6164-3c8e-4b45-a4e6-bae32e06d084)
    { id: '910f6164-3c8e-4b45-a4e6-bae32e06d084', price: '2600.00', dimensions: '19.5 x 25 cm' },
    
    // Update: Group of Standing Farmers (ID: 1dfcf97a-e3a8-493d-84d8-fe194cca7367)
    { id: '1dfcf97a-e3a8-493d-84d8-fe194cca7367', artist: 'ANEURIN JONES', price: '6000.00', dimensions: '38 x 53 cm' },
    
    // Update: Porth Uchaf (ID: 1c6069f3-817b-4e57-ba9c-6fb01dffa036)
    { id: '1c6069f3-817b-4e57-ba9c-6fb01dffa036', artist: 'MAUD SALMON', price: '360.00', dimensions: '7.5 x 11 cm' },
    
    // Update: Buchod Dafydd (ID: 77246dd5-9710-4683-8472-610cff420fae)
    { id: '77246dd5-9710-4683-8472-610cff420fae', price: '1130.00', dimensions: '72 x 47 cm' },
    
    // Update: The Rising Moon (ID: 41a9d192-c920-440b-9fff-0c0b23978fd5)
    { id: '41a9d192-c920-440b-9fff-0c0b23978fd5', price: '810.00', dimensions: '19 x 25 cm' },
    
    // Update: Bathers (ID: d646d273-5801-487f-aee4-cd7d80b327f4)
    { id: 'd646d273-5801-487f-aee4-cd7d80b327f4', artist: 'RONALD HERBERT JOHN LAWRENCE', price: '500.00', dimensions: '35 x 52 cm' },
    
    // Update: Coastal view at Dusk, Saundersfoot, Pembrokeshire (ID: 6de47a88-39bd-4049-ac47-b7e2640ea09c)
    { id: '6de47a88-39bd-4049-ac47-b7e2640ea09c', price: '1660.00', dimensions: '45 x 73 cm' },
    
    // Update: All Flash (ID: 52eb7ddb-1dec-4cc5-9812-5c4b86d1338e)
    { id: '52eb7ddb-1dec-4cc5-9812-5c4b86d1338e', price: '920.00', dimensions: '50 x 40 cm' },
    
    // Update: Anyworld (ID: 1cfddecc-69ed-44b4-a4f7-62e3f0bacc96)
    { id: '1cfddecc-69ed-44b4-a4f7-62e3f0bacc96', price: '680.00', dimensions: '50 x 40 cm' },
    
    // Update: Feeding the Birds (ID: ce3d6a8c-503a-49c3-b039-10939117897f)
    { id: 'ce3d6a8c-503a-49c3-b039-10939117897f', artist: 'WILL EVANS', price: '920.00', year: '1887', dimensions: '67 x 49 cm' },
    
    // Update: Moon Dog (ID: c21afb72-be47-465d-bf21-dd8e6148d6e7)
    { id: 'c21afb72-be47-465d-bf21-dd8e6148d6e7', price: '720.00', year: '1951', dimensions: '21 x 24 cm' },
    
    // Update: Gower Beach (ID: 20bd5c92-a39e-4eaa-a895-078b814f9df5)
    { id: '20bd5c92-a39e-4eaa-a895-078b814f9df5', price: '390.00', year: '1955', dimensions: '22 x 36 cm' },
    
    // Update: Sloop Inn, St. Ives (ID: 90a193c1-9dff-4a4a-aebf-7221e4e63320)
    { id: '90a193c1-9dff-4a4a-aebf-7221e4e63320', artist: 'WILL EVANS', price: '670.00', year: '1887', dimensions: '39 x 57 cm' },
    
    // Update: Victoria & Albert Museum (ID: 7ca1b2d0-1411-4c28-b3fd-789f99aac8f1)
    { id: '7ca1b2d0-1411-4c28-b3fd-789f99aac8f1', artist: 'SIR FRANK BRANGWYN RA HRSA RSW RWS PRBA RE HRMS ROI', price: '800.00', year: '1867', dimensions: '52 x 62 cm' },
    
    // Update: The Brangwyn Portfolio of lithographs, with additional etchings, (ID: ed75d5d1-c101-44f9-9320-bc3af324cef1)
    { id: 'ed75d5d1-c101-44f9-9320-bc3af324cef1', price: '2060.00', year: '1867', dimensions: 'Smallest 28 x 35 cm Largest 55 x 35 cm' },
    
    // Update: The Brangwyn Portfolio of lithographs (ID: 76e1c128-405e-4cd7-a10d-e77e1190afd8)
    { id: '76e1c128-405e-4cd7-a10d-e77e1190afd8', price: '2060.00', year: '1867', dimensions: 'Smallest 28 x 28 cm Largest 45 x 28 cm' },
    
    // Update: Three Blind Women & The Drunk (ID: f54666da-c906-4500-8bbb-9bc213891609)
    { id: 'f54666da-c906-4500-8bbb-9bc213891609', artist: 'SIR FRANK BRANGWYN RA', price: '310.00', year: '1972', dimensions: '37 x 24 cm, 28 x 28 cm' },
    
    // Update: Australian Crucifixion (ID: 4444869f-aa78-461a-b89c-d37684da2482)
    { id: '4444869f-aa78-461a-b89c-d37684da2482', price: '670.00', year: '1920', dimensions: '64 x 45 cm, 76 x 51 cm' },
    
    // Update: Tyger Tyger (ID: bcc63339-5ba2-426a-9670-f2d5f5d52eee)
    { id: 'bcc63339-5ba2-426a-9670-f2d5f5d52eee', price: '464.00', year: '1920', dimensions: '64 x 45 cm' },
    
    // Update: London (ID: 94af2c62-d092-4e27-b79a-53289d843c8b)
    { id: '94af2c62-d092-4e27-b79a-53289d843c8b', price: '2318.40', year: '1920', dimensions: '64 x 45 cm' },
    
    // Update: Everybody Wants to be Somebody (ID: 5f803ba1-c057-4142-b1eb-9d7987880858)
    { id: '5f803ba1-c057-4142-b1eb-9d7987880858', price: '360.64', year: '1920', dimensions: '61 x 43 cm' },
    
    // Update: Free at last (ID: f4eb72ae-b798-40b5-90ae-599e03cc92fc)
    { id: 'f4eb72ae-b798-40b5-90ae-599e03cc92fc', price: '772.80', year: '1920', dimensions: '88 x 55 cm' },
    
    // Update: Profile in Courage (ID: fad37896-2cf8-4661-8906-c7eeb4ccb4d4)
    { id: 'fad37896-2cf8-4661-8906-c7eeb4ccb4d4', price: '875.84', year: '1920', dimensions: '64 x 52 cm', medium: 'Lithograph' },
    
    // Update: Nobody Can Stop an Idea Whose Time Has Come' (ID: a6595878-d87c-4a24-873d-59dc27ffd391)
    { id: 'a6595878-d87c-4a24-873d-59dc27ffd391', price: '463.68', year: '1920', dimensions: '63 x 48 cm', medium: 'Lithograph' },
    
    // Update: Under the Yew Tree (ID: 29139efd-ccaa-49e0-a7d9-003ca7fbbe89)
    { id: '29139efd-ccaa-49e0-a7d9-003ca7fbbe89', price: '721.28', year: '1920', dimensions: '62 x 42 cm', medium: 'Lithograph' },
    
    // Update: Faith (ID: 59945b38-1d7e-4962-8003-79701ee88853)
    { id: '59945b38-1d7e-4962-8003-79701ee88853', price: '3091.20', year: '1920', dimensions: '77 x 52 cm', medium: 'Lithograph' },
    
    // Update: How many ages (ID: 16b3ae68-1b4b-440e-83b7-6fb21457cf3e)
    { id: '16b3ae68-1b4b-440e-83b7-6fb21457cf3e', price: '238.96', year: '1920', dimensions: '59 x 51 cm', medium: 'lithograph' },
    
    // Update: St James (ID: e1c90383-64b3-4291-85ae-4e54aaf03012)
    { id: 'e1c90383-64b3-4291-85ae-4e54aaf03012', price: '380.00', year: '1966', dimensions: '54 x 70 cm', medium: 'lithograph' },
    
    // Update: Verso (ID: 3035f140-51a9-43c9-aa9b-f3055d7495fb)
    { id: '3035f140-51a9-43c9-aa9b-f3055d7495fb', artist: 'JOHN BRUNSDON', price: '260.00', year: '1933', dimensions: '14 x 30 cm' },
    
    // Update: The Steps (ID: eb87d8f9-399d-4f34-92fa-dbf39f3e3d52)
    { id: 'eb87d8f9-399d-4f34-92fa-dbf39f3e3d52', price: '670.00', year: '1908', dimensions: '46 x 54 cm', medium: 'Hand-coloured' },
    
    // Update: Viaggio Verso II Nord (ID: b09de55f-150f-4af5-94d3-acf4473b0b28)
    { id: 'b09de55f-150f-4af5-94d3-acf4473b0b28', artist: 'CERI RICHARDS CBE', price: '1030.00', year: '1903', dimensions: '43 x 30 cm' },
    
    // Update: Viaggio Verso il Nord 1972 (ID: 0962cfa0-1f52-4551-a5eb-f0e1060e4b19)
    { id: '0962cfa0-1f52-4551-a5eb-f0e1060e4b19', artist: 'CERI RICHARDS CBE', price: '1800.00', dimensions: '43 x 30 cm' },
    
    // Update: Cockatoo (ID: cc114fcf-05dd-4931-a7f9-a9c87c80f24d)
    { id: 'cc114fcf-05dd-4931-a7f9-a9c87c80f24d', price: '4000.00', dimensions: '41.5 x 18 cm' },
    
    // Update: Cottage Landscape (ID: cc6aef17-84f4-4b63-85d4-a24640849e23)
    { id: 'cc6aef17-84f4-4b63-85d4-a24640849e23', artist: 'JOSEPH THORS', price: '857.60', dimensions: '49.5 x 75 cm', medium: 'Oil on canvas' },
    
    // Update: Ice skaters on a frozen river (ID: 35db30a0-27ea-4bf9-a810-4047ef996472)
    { id: '35db30a0-27ea-4bf9-a810-4047ef996472', artist: 'CIRCLE OF CHARLES HENRI JOSEPH LEICKERT', price: '1072.00', dimensions: '54 x 75 cm', medium: 'Oil on canvas' },
    
    // Update: The Hedgecutter (ID: efa38e2a-f8ed-4cf0-b52a-16447d6895b8)
    { id: 'efa38e2a-f8ed-4cf0-b52a-16447d6895b8', artist: 'WILLIAM TURNER', price: '7289.60', dimensions: '90 x 39 x 47 cm', medium: 'Oil on board' },
    
    // Update: The Fuel Gatherers (ID: 6e28cc7c-0953-4dad-94d9-bdb18e365dce)
    { id: '6e28cc7c-0953-4dad-94d9-bdb18e365dce', artist: 'WILLIAM SHAYER', price: '857.60', year: '1879', dimensions: '49 x 69 cm', medium: 'Oil on canvas' },
    
    // Update: Abstract still life (ID: 4114e72f-251c-422d-ab50-86e7c24399a3)
    { id: '4114e72f-251c-422d-ab50-86e7c24399a3', artist: 'PETER OLIVER', price: '2894.40', year: '1927', dimensions: '119 x 99 cm', medium: 'Large oil on board' },
    
    // Update: Gundog pair stalking grouse in cover (ID: 976b13c7-057b-4187-9153-380ccfd912db)
    { id: '976b13c7-057b-4187-9153-380ccfd912db', artist: 'NELSON GRAY KINSLEY', price: '643.20', year: '1863', dimensions: '87 x 29 x 42 cm', medium: 'Oil on canvas' },
    
    // Update: Looking towards the harbour (ID: e92cfd9b-6b71-4492-b642-87cdd737c8c5)
    { id: 'e92cfd9b-6b71-4492-b642-87cdd737c8c5', artist: 'HELEN ALLINGHAM RWS', price: '643.20', year: '1848', dimensions: '29 x 19 cm', medium: 'Watercolour' },
    
    // Update: Terriers at a rabbit hole (ID: 0170258c-4390-4621-ad0e-974b015aee14)
    { id: '0170258c-4390-4621-ad0e-974b015aee14', artist: 'GEORGE ARMFIELD', price: '643.20', year: '1808', dimensions: '49.5 x 75 cm', medium: 'Oil on canvas' },
    
    // Update: Oude Scheld - Texel Island (ID: 949ef61f-5977-4985-92b1-a599773933bc)
    { id: '949ef61f-5977-4985-92b1-a599773933bc', artist: 'FOLLOWER OF JOHN CLARKSON STANFIELD', price: '536.00', year: '1828', dimensions: '33.5 x 43.5 cm', medium: 'Oil on canvas' },
    
    // Update: Children on a street corner (ID: b0153ac0-64de-4e83-a05c-1ffa143f8ae0)
    { id: 'b0153ac0-64de-4e83-a05c-1ffa143f8ae0', artist: 'AUGUSTUS EDWIN MULREADY', price: '2572.80', year: '1844', dimensions: '29 x 22 cm', medium: 'Mixed media' },
    
    // Update: French Street Scene (ID: 3e015d31-f219-42fd-8788-1e7cd3dca099)
    { id: '3e015d31-f219-42fd-8788-1e7cd3dca099', artist: 'Anthony Gross CBE', price: '6432.00', year: '1905', dimensions: '31 x 40 cm', medium: 'Oil on board' },
    
    // Update: Romeo and Juliet (ID: f29aaf75-bde5-4acf-b6b5-51244b1ac4f4)
    { id: 'f29aaf75-bde5-4acf-b6b5-51244b1ac4f4', price: '2000.00', year: '1972', dimensions: '161 x 104 x 10 cm', medium: 'Mixed media' },
    
    // Update: Frieize Of Wallflowers #1 (ID: d4cf9962-0f18-40e6-9daa-ddd5fdc86aa1)
    { id: 'd4cf9962-0f18-40e6-9daa-ddd5fdc86aa1', price: '2000.00', year: '1972', dimensions: '104 x 88 cm', medium: 'Oil on canvas' },
    
    // Update: Passing Snowstorm Over The Dee Valley (ID: 0967af16-08d2-4a39-bc43-51150773d4ee)
    { id: '0967af16-08d2-4a39-bc43-51150773d4ee', price: '2500.00', year: '1972', dimensions: '89 x 74 cm', medium: 'Oil on canvas' },
    
    // Update: Frieize of Wallflowers #2 (ID: 36f7edd9-f385-46d1-8c8a-959432967047)
    { id: '36f7edd9-f385-46d1-8c8a-959432967047', price: '2000.00', year: '1972', dimensions: '104 x 88 cm', medium: 'Oil on canvas' },
    
    // Update: Concourse (ID: 7e21678a-dcd5-4478-a436-948f10ecb0ce)
    { id: '7e21678a-dcd5-4478-a436-948f10ecb0ce', price: '4800.00', year: '1972', dimensions: '94 x 109 cm', medium: 'Oil on canvas' },
    
    // Update: Hollyhocks (ID: 103f801f-9c7a-4ff9-a9f7-9d308d1758ea)
    { id: '103f801f-9c7a-4ff9-a9f7-9d308d1758ea', price: '4800.00', year: '1972', dimensions: '120 x 93 cm', medium: 'Oil on canvas' },
    
    // Update: Simon Labret (ID: 0574f7ec-cf75-4913-8b50-dbbbe2acd054)
    { id: '0574f7ec-cf75-4913-8b50-dbbbe2acd054', price: '2000.00', year: '1972', dimensions: '42 x 35 x 30 cm' },
    
    // Update: Temptation of Eros (ID: 0a65833b-abc2-41cd-9226-e24fb314e935)
    { id: '0a65833b-abc2-41cd-9226-e24fb314e935', price: '2500.00', year: '1972', dimensions: '67 x 73 cm', medium: 'Oil on canvas' },
    
    // Update: Painting School of Canaletto (ID: 89332c6c-c12a-4f58-a499-d07cfacec0d3)
    { id: '89332c6c-c12a-4f58-a499-d07cfacec0d3', price: '3000.00', year: '1972', dimensions: '87 x 80 x 10 cm', medium: 'Oil on canvas' },
    
    // Update: River Dee (ID: 0762d9b0-ccbe-4878-85d2-4d8efa0f7f71)
    { id: '0762d9b0-ccbe-4878-85d2-4d8efa0f7f71', price: '2000.00', year: '1972', dimensions: '98 x 88 cm', medium: 'Oil on canvas' },
    
    // Update: The Painting School of Canaletto (ID: 2850fd7b-5c9c-4963-a3f6-22dd17cd89a4)
    { id: '2850fd7b-5c9c-4963-a3f6-22dd17cd89a4', price: '3000.00', year: '1972', dimensions: '82 x 37 x 22 cm', medium: 'Oil on canvas' },
    
    // Update: Bachman [1863 � 1956] (ID: d0251ba2-091c-4eec-b5eb-8bf6131bc3d1)
    { id: 'd0251ba2-091c-4eec-b5eb-8bf6131bc3d1', price: '9000.00', year: '1863', dimensions: '122 x 98 x 10 cm', medium: 'Oil on canvas' }
  ]

  try {
    for (const update of updates) {
      try {
        // Check if the artwork exists
        const existing = await prisma.product.findUnique({
          where: { id: update.id },
          select: { id: true, name: true }
        })
        
        if (!existing) {
          errorCount++
          errors.push(`Artwork with ID ${update.id} not found`)
          continue
        }

        // Build update data object
        const updateData: any = {}
        if (update.artist) updateData.artist = update.artist
        if (update.price) updateData.price = update.price
        if (update.dimensions) updateData.dimensions = update.dimensions
        if (update.year) updateData.year = update.year
        if (update.medium) updateData.medium = update.medium

        // Update the artwork
        await prisma.product.update({
          where: { id: update.id },
          data: updateData
        })
        
        successCount++
        console.log(`✓ Updated: ${existing.name} (${update.id})`)
      } catch (err) {
        errorCount++
        errors.push(`Error updating ${update.id}: ${err}`)
      }
    }

    console.log('\n=== Update Summary ===')
    console.log(`Total updates attempted: ${updates.length}`)
    console.log(`Successful updates: ${successCount}`)
    console.log(`Failed updates: ${errorCount}`)
    
    if (errors.length > 0) {
      console.log('\n=== Errors ===')
      errors.forEach(error => console.log(error))
    }
    
  } catch (error) {
    console.error('Fatal error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

applyArtworkUpdates()