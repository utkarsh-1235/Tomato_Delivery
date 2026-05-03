import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConflictException } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { Inventory } from './inventory.schema';
import { AddInventoryDto } from './inventory.dto';

describe('InventoryService', () => {
  let service: InventoryService;
  let inventoryModelMock: jest.Mock & {
    findOne: jest.Mock;
    findOneAndUpdate: jest.Mock;
  };
  let redisMock: {
    get: jest.Mock;
    set: jest.Mock;
    del: jest.Mock;
  };

  const dto: AddInventoryDto = {
    productId: 'prod-1',
    restaurantId: 'rest-1',
    productName: 'Tomatoes',
    description: 'Fresh tomatoees',
    availableStock: 100,
    reserved: 0,
  };

  beforeEach(async () => {
    redisMock = {
      get: jest.fn(),
      set: jest.fn().mockResolvedValue('OK'),
      del: jest.fn().mockResolvedValue(1),
    };

    inventoryModelMock = Object.assign(jest.fn(), {
      findOne: jest.fn(),
      findOneAndUpdate: jest.fn(),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        {
          provide: getModelToken(Inventory.name),
          useValue: inventoryModelMock,
        },
        { provide: 'REDIS_CLIENT', useValue: redisMock },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createItem', () => {
    it('saves document, invalidates cache for productId, returns saved doc', async () => {
      const saved = { ...dto, _id: 'id-1' };
      const save = jest.fn().mockResolvedValue(saved);
      inventoryModelMock.mockImplementation(() => ({ save }));

      const result = await service.createItem(dto);

      expect(inventoryModelMock).toHaveBeenCalledWith(dto);
      expect(save).toHaveBeenCalled();
      expect(redisMock.del).toHaveBeenCalledWith('inventory:prod-1');
      expect(result).toEqual(saved);
    });
  });

  describe('getItemById', () => {
    it('returns parsed value from Redis on cache hit', async () => {
      const cached = { productId: 'prod-1', availableStock: 10 };
      redisMock.get.mockResolvedValue(JSON.stringify(cached));

      const result = await service.getItemById('prod-1');

      expect(redisMock.get).toHaveBeenCalledWith('inventory:prod-1');
      expect(inventoryModelMock.findOne).not.toHaveBeenCalled();
      expect(result).toEqual(cached);
    });

    it('loads from DB on cache miss, sets cache with TTL, returns item', async () => {
      redisMock.get.mockResolvedValue(null);
      const doc = { productId: 'prod-1', availableStock: 5 };
      inventoryModelMock.findOne = jest.fn().mockResolvedValue(doc);

      const result = await service.getItemById('prod-1');

      expect(inventoryModelMock.findOne).toHaveBeenCalledWith({
        productId: 'prod-1',
      });
      expect(redisMock.set).toHaveBeenCalledWith(
        'inventory:prod-1',
        JSON.stringify(doc),
        'EX',
        600,
      );
      expect(result).toEqual(doc);
    });
  });

  describe('ReserveItem', () => {
    it('throws when productId is missing', async () => {
      await expect(
        service.ReserveItem({ quantity: 1 }),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('throws when quantity is missing', async () => {
      await expect(
        service.ReserveItem({ productId: 'prod-1' }),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('throws when stock is insufficient (no document updated)', async () => {
      inventoryModelMock.findOneAndUpdate = jest.fn().mockResolvedValue(null);

      await expect(
        service.ReserveItem({ productId: 'prod-1', quantity: 5 }),
      ).rejects.toBeInstanceOf(ConflictException);

      expect(redisMock.del).not.toHaveBeenCalled();
    });

    it('decrements availableStock, increments reserved, clears cache', async () => {
      const updated = {
        productId: 'prod-1',
        availableStock: 95,
        reserved: 5,
      };
      inventoryModelMock.findOneAndUpdate = jest
        .fn()
        .mockResolvedValue(updated);

      const result = await service.ReserveItem({
        productId: 'prod-1',
        quantity: 5,
      });

      expect(inventoryModelMock.findOneAndUpdate).toHaveBeenCalledWith(
        { productId: 'prod-1', availableStock: { $gte: 5 } },
        { $inc: { availableStock: -5, reserved: 5 } },
        { new: true },
      );
      expect(redisMock.del).toHaveBeenCalledWith('inventory:prod-1');
      expect(result).toEqual(updated);
    });
  });

  describe('ConfirmItem',() => {
    it('throws when productId is missing', async () => {
      await expect(
        service.ConfirmItem({ quantity: 2 }),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('throws when quantity is missing', async () => {
      await expect(
        service.ConfirmItem({ productId: 'prod-1' }),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('throws when no document is updated (invalid confirm)', async () => {
      inventoryModelMock.findOneAndUpdate = jest.fn().mockResolvedValue(null);
  
      await expect(
        service.ConfirmItem({ productId: 'prod-1', quantity: 2 }),
      ).rejects.toBeInstanceOf(ConflictException);
  
      expect(redisMock.del).not.toHaveBeenCalled();
    });

    it('decrements reserved stock and clears cache', async () => {
      const updated = {
        productId: 'prod-1',
        availableStock: 95,
        reserved: 3,
      };
  
      inventoryModelMock.findOneAndUpdate = jest
        .fn()
        .mockResolvedValue(updated);
  
      const result = await service.ConfirmItem({
        productId: 'prod-1',
        quantity: 2,
      });
  
      expect(inventoryModelMock.findOneAndUpdate).toHaveBeenCalledWith(
        { productId: 'prod-1' },
        { $inc: { reserved: -2 } },
        { new: true },
      );
  
      expect(redisMock.del).toHaveBeenCalledWith('inventory:prod-1');
      expect(result).toEqual(updated);
    });
  })

  describe('ReleaseStock',() => {
    it('throws when productId is missing', async () => {
      await expect(
        service.ReleaseStock({ quantity: 2 }),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('throws when quantity is missing', async () => {
      await expect(
        service.ReleaseStock({ productId: 'prod-1' }),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('throws when no document is updated (invalid release)', async () => {
      inventoryModelMock.findOneAndUpdate = jest.fn().mockResolvedValue(null);
  
      await expect(
        service.ReleaseStock({ productId: 'prod-1', quantity: 2 }),
      ).rejects.toBeInstanceOf(ConflictException);
  
      expect(redisMock.del).not.toHaveBeenCalled();
    });

    it('increments availableStock, decrement reserved, clears cache', async () => {
      const updated = {
        productId: 'prod-1',
        availableStock: 95,
        reserved: 10,
      };
      inventoryModelMock.findOneAndUpdate = jest
        .fn()
        .mockResolvedValue(updated);

      const result = await service.ReleaseStock({
        productId: 'prod-1',
        quantity: 5,
      });

      expect(inventoryModelMock.findOneAndUpdate).toHaveBeenCalledWith(
        { productId: 'prod-1' },
        { $inc: { availableStock: +5, reserved: -5 } },
        { new: true },
      );
      expect(redisMock.del).toHaveBeenCalledWith('inventory:prod-1');
      expect(result).toEqual(updated);
    });
  })
});
