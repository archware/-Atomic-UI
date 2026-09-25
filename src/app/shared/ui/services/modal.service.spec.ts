import { ModalService } from './modal.service';

describe('ModalService', () => {
  beforeEach(() => jasmine.clock().install());
  afterEach(() => jasmine.clock().uninstall());

  it('uses one identifier and closes the confirmed modal', () => {
    const service = new ModalService();
    let confirmed = false;
    const id = service.confirm({
      title: 'Eliminar',
      message: 'Confirme la operación.',
      confirmVariant: 'danger',
      onConfirm: () => { confirmed = true; },
    });

    expect(id).toBe(1);
    service.modals()[0].buttons?.[1].action();
    expect(confirmed).toBeTrue();
    expect(service.modals()[0].closing).toBeTrue();
    jasmine.clock().tick(200);
    expect(service.modals()).toEqual([]);
  });

  it('keeps open actions scoped to their own modal', () => {
    const service = new ModalService();
    const firstId = service.open({ title: 'Primero', message: 'Mensaje' });
    const secondId = service.open({ title: 'Segundo', message: 'Mensaje' });

    service.close(firstId);
    jasmine.clock().tick(200);

    expect(service.modals().map((modal) => modal.id)).toEqual([secondId]);
  });
});
