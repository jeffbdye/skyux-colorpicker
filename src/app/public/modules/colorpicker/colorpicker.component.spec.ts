import {
  async,
  fakeAsync,
  TestBed,
  tick,
  ComponentFixture
} from '@angular/core/testing';

import {
  expect
} from '@skyux-sdk/testing';

import {
  By
} from '@angular/platform-browser';

import {
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';

import 'rxjs/add/operator/sampleTime';

import {
  SkyColorpickerModule
} from './colorpicker.module';

import {
  ColorpickerTestComponent
} from './fixtures/colorpicker-component.fixture';

import {
  SkyColorpickerComponent
} from './colorpicker.component';

import {
  SkyColorpickerMessageType
} from './types';

import {
  SkyColorpickerInputDirective
} from './colorpicker-input.directive';

import {
  ColorpickerReactiveTestComponent
} from './fixtures/colorpicker-reactive-component.fixture';

describe('Colorpicker Component', () => {
  let fixture: ComponentFixture<any>;
  let nativeElement: HTMLElement;
  let colorpickerComponent: SkyColorpickerComponent;

  function openColorpicker(element: HTMLElement, compFixture: ComponentFixture<any>) {
    tick();
    fixture.detectChanges();
    verifyMenuVisibility(false);

    const buttonElem = element.querySelector('.sky-dropdown-button') as HTMLElement;
    buttonElem.click();
    tick();
    fixture.detectChanges();
    tick();
    verifyMenuVisibility();
  }

  function applyColorpicker(element: HTMLElement, compFixture: ComponentFixture<ColorpickerTestComponent>) {
    const buttonElem = element.querySelector('.sky-btn-colorpicker-apply') as HTMLElement;
    buttonElem.click();
    tick();
    fixture.detectChanges();
  }

  function closeColorpicker(element: HTMLElement, compFixture: ComponentFixture<ColorpickerTestComponent>) {
    const buttonElem = element.querySelector('.sky-btn-colorpicker-close') as HTMLElement;
    buttonElem.click();
    tick();
    fixture.detectChanges();
  }

  function verifyMenuVisibility(isVisible = true) {
    const popoverElem = fixture.nativeElement.querySelector('.sky-popover-container');
    expect(getComputedStyle(popoverElem).visibility !== 'hidden').toEqual(isVisible);
  }

  function setPresetColor(element: HTMLElement, compFixture: ComponentFixture<any>, key: number) {
    let presetColors = element.querySelectorAll('.sky-preset-color') as NodeListOf<HTMLElement>;
    let applyColor = element.querySelector('.sky-btn-colorpicker-apply') as HTMLButtonElement;
    presetColors[key].click();
    applyColor.click();
    applyColor.click();
    compFixture.detectChanges();
  }

  function keyHelper(keyName: string, key: number, deprecatedKeyName: string) {
    let document = <HTMLDocument>nativeElement.parentNode.parentNode.parentNode;
    let keyPress: KeyboardEvent;
    try { // Chrome, Safari, Firefox
      keyPress = new KeyboardEvent('keydown', {
        'key': keyName,
        'code': keyName,
        'view': window,
        'bubbles': true,
        'cancelable': true
      });
      document.dispatchEvent(keyPress);
    } catch (error) {
      // Deprecated browser API... IE
      let keyPressDeprecated = document.createEvent('KeyboardEvent');
      keyPressDeprecated.initKeyboardEvent('keydown', true, true, window,
        deprecatedKeyName, 27, 'window', false, '');
      document.dispatchEvent(keyPressDeprecated);
    }
  }

  function mouseHelper(x: number, y: number, event: string) {
    let document = <HTMLDocument>nativeElement.parentNode.parentNode.parentNode;

    try {
      // Deprecated browser API... IE
      let mouseEventDeprecated = document.createEvent('MouseEvents');
      mouseEventDeprecated.initMouseEvent(
        event, true, true, window, 0, 0, 0, x, y, false, false, false, false, 0, undefined
      );
      document.dispatchEvent(mouseEventDeprecated);
    } catch (error) {
      // Chrome, Safari, Firefox
      let mouseEvent = new MouseEvent(event, {
        'clientX': x,
        'clientY': y
      });
      document.dispatchEvent(mouseEvent);
    }
    fixture.detectChanges();
  }

  function verifyColorpicker(element: HTMLElement, spaColor: string, test: string) {
    fixture.detectChanges();
    fixture.whenStable();
    let inputElement: HTMLInputElement = element.querySelector('input');
    expect(inputElement.value).toBe(spaColor);
    let selectedColor: HTMLDivElement = <HTMLDivElement>element.querySelector('.sky-colorpicker-input');
    let browserCSS = selectedColor.style.backgroundColor.replace(/[rgba\(\)]/g, '').split(',');
    // Some browsers convert RGBA to multiple points pass the decimal.
    let outcome = browserCSS.map((eachNumber) => {
      return Math.round(Number(eachNumber) * 100) / 100;
    });
    expect(outcome.toString()).toContain(test.replace(/[\s]/g, '').split(',').toString());
  }

  function getElementCords(elementRef: any) {
    const rect = (elementRef.nativeElement as HTMLElement).getBoundingClientRect();
    const coords = {
      x: Math.round(rect.left + (rect.width / 2)),
      y: Math.round(rect.top + (rect.height / 2))
    };

    return coords;
  }

  function setInputElementValue(element: HTMLElement, name: string, value: string) {
    fixture.detectChanges();
    fixture.whenStable();
    let inputElement: NodeListOf<Element> =
      element.querySelectorAll('.rgba-text > div:last-child > input');
    let input: any = {
      'hex': inputElement[0],
      'red': inputElement[1],
      'green': inputElement[2],
      'blue': inputElement[3],
      'alpha': inputElement[4]
    };
    input[name].value = value;
    let params: any = {
      'bubbles': false,
      'cancelable': false
    };
    let inputEvent = document.createEvent('Event');
    inputEvent.initEvent('input', params.bubbles, params.cancelable);
    let changeEvent = document.createEvent('Event');
    changeEvent.initEvent('change', params.bubbles, params.cancelable);
    input[name].dispatchEvent(inputEvent);
    input[name].dispatchEvent(changeEvent);
    fixture.detectChanges();
    fixture.whenStable();
    return input[name];
  }

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        ColorpickerTestComponent,
        ColorpickerReactiveTestComponent
      ],
      imports: [
        SkyColorpickerModule,
        FormsModule,
        ReactiveFormsModule
      ]
    }).compileComponents();
  }));

  describe('standard setup', () => {

    let component: ColorpickerTestComponent;

    beforeEach(() => {
      fixture = TestBed.createComponent(ColorpickerTestComponent);
      nativeElement = fixture.nativeElement as HTMLElement;
      component = <ColorpickerTestComponent> fixture.componentInstance;
      colorpickerComponent = component.colorpickerComponent;
    });

    it('should populate correct information if model is given', fakeAsync(() => {
      component.selectedColor = undefined;
      component.colorModel = '#00f';
      fixture.detectChanges();
      tick();
      expect(component.colorpickerComponent.initialColor).toBe('#00f');
      expect(component.colorpickerComponent.lastAppliedColor).toEqual({
        cmykText: 'cmyk(100%,100%,0%,0%)',
        hslaText: 'hsla(240,100%,50%,1)',
        rgbaText: 'rgba(0,0,255,1)',
        hsva: { hue: 240, saturation: 100, value: 100, alpha: 1 },
        rgba: { red: 0, green: 0, blue: 255, alpha: 1 },
        hsla: { hue: 240, saturation: 100, lightness: 50, alpha: 1 },
        cmyk: { cyan: 100, magenta: 100, yellow: 0, key: 0 },
        hex: '#00f'
      });
    }));

    it('should populate correct information if model is given but an initial color is also given', fakeAsync(() => {
      component.colorModel = '#00f';
      fixture.detectChanges();
      tick();
      expect(component.colorpickerComponent.initialColor).toBe('#2889e5');
      expect(component.colorpickerComponent.lastAppliedColor).toEqual({
        cmykText: 'cmyk(100%,100%,0%,0%)',
        hslaText: 'hsla(240,100%,50%,1)',
        rgbaText: 'rgba(0,0,255,1)',
        hsva: { hue: 240, saturation: 100, value: 100, alpha: 1 },
        rgba: { red: 0, green: 0, blue: 255, alpha: 1 },
        hsla: { hue: 240, saturation: 100, lightness: 50, alpha: 1 },
        cmyk: { cyan: 100, magenta: 100, yellow: 0, key: 0 },
        hex: '#00f'
      });
    }));

    it('should add aria-label to input if not specified', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      expect(nativeElement.querySelector('input').getAttribute('aria-label')).toBe('Color value');
    }));

    it('should not add aria-label to input when one was specified', fakeAsync(() => {
      nativeElement.querySelector('input').setAttribute('aria-label', 'Best picker');
      fixture.detectChanges();
      tick();
      expect(nativeElement.querySelector('input').getAttribute('aria-label')).toBe('Best picker');
    }));

    it('should output RGBA', fakeAsync(() => {
      component.selectedOutputFormat = 'rgba';
      openColorpicker(nativeElement, fixture);
      setPresetColor(nativeElement, fixture, 4);
      verifyColorpicker(nativeElement, 'rgba(189,64,64,1)', '189, 64, 64');
    }));

    it('should handle undefined initial color', fakeAsync(() => {
      fixture.detectChanges();
      fixture.destroy();

      fixture = TestBed.createComponent(ColorpickerTestComponent);
      nativeElement = fixture.nativeElement as HTMLElement;
      component = fixture.componentInstance;

      component.selectedHexType = 'hex8';
      component.selectedOutputFormat = 'hex';
      component.selectedColor = undefined;

      fixture.detectChanges();
      tick();

      openColorpicker(nativeElement, fixture);
      applyColorpicker(nativeElement, fixture);
      verifyColorpicker(nativeElement, '#fff', '255, 255, 255');
    }));

    it('should handle RGB initial color', fakeAsync(() => {
      fixture.detectChanges();
      fixture.destroy();

      fixture = TestBed.createComponent(ColorpickerTestComponent);
      nativeElement = fixture.nativeElement as HTMLElement;
      component = fixture.componentInstance;

      component.selectedOutputFormat = 'rgba';
      component.selectedColor = 'rgb(0,0,255)';

      openColorpicker(nativeElement, fixture);
      applyColorpicker(nativeElement, fixture);
      verifyColorpicker(nativeElement, 'rgba(0,0,255,1)', '0, 0, 255');
    }));

    it('should output HEX', fakeAsync(() => {
      component.selectedOutputFormat = 'hex';
      openColorpicker(nativeElement, fixture);
      setPresetColor(nativeElement, fixture, 4);
      verifyColorpicker(nativeElement, '#bd4040', '189, 64, 64');
    }));

    it('should accept a new HEX3 color.', fakeAsync(() => {
      component.selectedOutputFormat = 'rgba';
      openColorpicker(nativeElement, fixture);
      setInputElementValue(nativeElement, 'hex', '#BC4');
      applyColorpicker(nativeElement, fixture);
      verifyColorpicker(nativeElement, 'rgba(187,204,68,1)', '187, 204, 68');
    }));

    it('should accept a new HEX6 color.', fakeAsync(() => {
      component.selectedOutputFormat = 'hex';
      openColorpicker(nativeElement, fixture);
      setInputElementValue(nativeElement, 'hex', '#BFF666');
      applyColorpicker(nativeElement, fixture);
      verifyColorpicker(nativeElement, '#bff666', '191, 246, 102');
    }));

    it('should accept a new RGB color.', fakeAsync(() => {
      component.selectedOutputFormat = 'hex';
      openColorpicker(nativeElement, fixture);
      setInputElementValue(nativeElement, 'red', '77');
      setInputElementValue(nativeElement, 'green', '58');
      setInputElementValue(nativeElement, 'blue', '183');
      applyColorpicker(nativeElement, fixture);
      verifyColorpicker(nativeElement, '#4d3ab7', '77, 58, 183');
    }));

    it('should accept a new RGBA color.', fakeAsync(() => {
      component.selectedOutputFormat = 'hex';
      openColorpicker(nativeElement, fixture);
      setInputElementValue(nativeElement, 'red', '163');
      setInputElementValue(nativeElement, 'green', '19');
      setInputElementValue(nativeElement, 'blue', '84');
      setInputElementValue(nativeElement, 'alpha', '0.3');
      applyColorpicker(nativeElement, fixture);
      verifyColorpicker(nativeElement, '#a31354', '163, 19, 84, 0.3');
    }));

    it('should accept a new HSL color.', fakeAsync(() => {
      component.selectedOutputFormat = 'hex';
      openColorpicker(nativeElement, fixture);
      setInputElementValue(nativeElement, 'hex', 'hsl(113,78%,41%)');
      applyColorpicker(nativeElement, fixture);
      verifyColorpicker(nativeElement, '#2aba17', '42, 186, 23');
    }));

    it('should accept a new HSLA color.', fakeAsync(() => {
      component.selectedOutputFormat = 'hex';
      openColorpicker(nativeElement, fixture);
      setInputElementValue(nativeElement, 'hex', 'hsla(231,66%,41%,0.62)');
      applyColorpicker(nativeElement, fixture);
      verifyColorpicker(nativeElement, '#2438ae', '36, 56, 174');
    }));

    it('should allow user to click cancel the color change.', fakeAsync(() => {
      component.selectedOutputFormat = 'hex';
      component.colorModel = '#2889e5';
      fixture.detectChanges();
      openColorpicker(nativeElement, fixture);
      setInputElementValue(nativeElement, 'hex', '#BFF666');
      closeColorpicker(nativeElement, fixture);
      verifyColorpicker(nativeElement, '#2889e5', '40, 137, 229');
    }));

    it('should use the last applied color to revert to on cancel', fakeAsync(() => {
      component.selectedOutputFormat = 'hex';
      component.colorModel = '#2889e5';
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      verifyColorpicker(nativeElement, '#2889e5', '40, 137, 229');
      openColorpicker(nativeElement, fixture);
      setInputElementValue(nativeElement, 'hex', '#2B7230');
      applyColorpicker(nativeElement, fixture);
      verifyColorpicker(nativeElement, '#2b7230', '43, 114, 48');
      openColorpicker(nativeElement, fixture);
      setInputElementValue(nativeElement, 'hex', '#BFF666');
      closeColorpicker(nativeElement, fixture);
      verifyColorpicker(nativeElement, '#2b7230', '43, 114, 48');
    }));

    it('should allow user to click apply the color change.', fakeAsync(() => {
      component.selectedOutputFormat = 'hex';
      openColorpicker(nativeElement, fixture);
      setInputElementValue(nativeElement, 'hex', '#2B7230');
      applyColorpicker(nativeElement, fixture);
      verifyColorpicker(nativeElement, '#2b7230', '43, 114, 48');
    }));

    it('should emit a selectedColorChanged and selectedColorApplied event on submit', fakeAsync(() => {
      spyOn(component.colorpickerComponent.selectedColorChanged, 'emit').and.callThrough();
      spyOn(component.colorpickerComponent.selectedColorApplied, 'emit').and.callThrough();
      component.selectedOutputFormat = 'hex';
      openColorpicker(nativeElement, fixture);
      setInputElementValue(nativeElement, 'hex', '#2B7230');
      applyColorpicker(nativeElement, fixture);
      verifyColorpicker(nativeElement, '#2b7230', '43, 114, 48');
      expect(component.colorpickerComponent.selectedColorChanged.emit).toHaveBeenCalled();
      expect(component.colorpickerComponent.selectedColorApplied.emit).toHaveBeenCalled();
    }));

    it('should accept mouse down events on hue bar.', fakeAsync(() => {
      component.selectedOutputFormat = 'hex';
      openColorpicker(nativeElement, fixture);

      const hueBar = fixture.debugElement.query(By.css('.hue'));
      const axis = getElementCords(hueBar);

      hueBar.triggerEventHandler('mousedown', { 'pageX': axis.x, 'pageY': axis.y });
      fixture.detectChanges();
      applyColorpicker(nativeElement, fixture);
      verifyColorpicker(nativeElement, '#28e5e5', '40, 229, 229');

      openColorpicker(nativeElement, fixture);
      hueBar.triggerEventHandler('mousedown', { 'pageX': axis.x - 50, 'pageY': axis.y });
      fixture.detectChanges();
      applyColorpicker(nativeElement, fixture);
      verifyColorpicker(nativeElement, '#a3e528', '163, 229, 40');

      openColorpicker(nativeElement, fixture);
      hueBar.triggerEventHandler('mousedown', { 'pageX': axis.x + 50, 'pageY': axis.y });
      fixture.detectChanges();
      applyColorpicker(nativeElement, fixture);
      verifyColorpicker(nativeElement, '#a328e5', '163, 40, 229');
    }));

    it('should accept mouse down events on alpha bar.', fakeAsync(() => {
      component.selectedOutputFormat = 'rgba';
      openColorpicker(nativeElement, fixture);

      const alphaBar = fixture.debugElement.query(By.css('.alpha'));
      const axis = getElementCords(alphaBar);

      alphaBar.triggerEventHandler('mousedown', { 'pageX': axis.x, 'pageY': axis.y });
      fixture.detectChanges();
      applyColorpicker(nativeElement, fixture);
      verifyColorpicker(nativeElement, 'rgba(40,137,229,0.5)', '40, 137, 229, 0.5');

      openColorpicker(nativeElement, fixture);
      alphaBar.triggerEventHandler('mousedown', { 'pageX': axis.x - 50, 'pageY': axis.y });
      fixture.detectChanges();
      applyColorpicker(nativeElement, fixture);
      verifyColorpicker(nativeElement, 'rgba(40,137,229,0.23)', '40, 137, 229, 0.23');

      openColorpicker(nativeElement, fixture);
      alphaBar.triggerEventHandler('mousedown', { 'pageX': axis.x + 50, 'pageY': axis.y });
      fixture.detectChanges();
      applyColorpicker(nativeElement, fixture);
      verifyColorpicker(nativeElement, 'rgba(40,137,229,0.77)', '40, 137, 229, 0.77');
    }));

    it('should accept mouse down events on saturation and lightness.', fakeAsync(() => {
      component.selectedOutputFormat = 'hex';
      openColorpicker(nativeElement, fixture);

      const slBar = fixture.debugElement.query(By.css('.saturation-lightness'));
      const axis = getElementCords(slBar);

      slBar.triggerEventHandler('mousedown', { 'pageX': axis.x, 'pageY': axis.y });
      fixture.detectChanges();
      applyColorpicker(nativeElement, fixture);
      verifyColorpicker(nativeElement, '#406080', '64, 96, 128');

      openColorpicker(nativeElement, fixture);
      slBar.triggerEventHandler('mousedown', { 'pageX': axis.x - 50, 'pageY': axis.y });
      fixture.detectChanges();
      applyColorpicker(nativeElement, fixture);
      verifyColorpicker(nativeElement, '#576b80', '87, 107, 128');

      openColorpicker(nativeElement, fixture);
      slBar.triggerEventHandler('mousedown', { 'pageX': axis.x - 50, 'pageY': axis.y / 2 });
      fixture.detectChanges();
      applyColorpicker(nativeElement, fixture);
      verifyColorpicker(nativeElement, '#92b3d6', '146, 179, 214');

      openColorpicker(nativeElement, fixture);
      slBar.triggerEventHandler('mousedown', { 'pageX': axis.x, 'pageY': axis.y / 2 });
      fixture.detectChanges();
      applyColorpicker(nativeElement, fixture);
      verifyColorpicker(nativeElement, '#6b9fd6', '107, 159, 214');

      openColorpicker(nativeElement, fixture);
      slBar.triggerEventHandler('mousedown', { 'pageX': axis.x + 50, 'pageY': axis.y / 2 });
      fixture.detectChanges();
      applyColorpicker(nativeElement, fixture);
      verifyColorpicker(nativeElement, '#438ad6', '67, 138, 214');

      openColorpicker(nativeElement, fixture);
      slBar.triggerEventHandler('mousedown', { 'pageX': axis.x + 50, 'pageY': axis.y });
      fixture.detectChanges();
      applyColorpicker(nativeElement, fixture);
      verifyColorpicker(nativeElement, '#285280', '40, 82, 128');
    }));

    it('should accept mouse dragging on saturation and lightness.', fakeAsync(() => {
      component.selectedOutputFormat = 'hex';
      openColorpicker(nativeElement, fixture);
      let slBar = fixture.debugElement.query(By.css('.saturation-lightness'));
      let axis = getElementCords(slBar);
      slBar.triggerEventHandler('mousedown', { 'pageX': axis.x, 'pageY': axis.y });
      fixture.detectChanges();
      mouseHelper(axis.x - 50, axis.y - 50, 'mousemove');
      fixture.detectChanges();
      applyColorpicker(nativeElement, fixture);
      verifyColorpicker(nativeElement, '#8babcb', '139, 171, 203');

      openColorpicker(nativeElement, fixture);
      mouseHelper(axis.x + 50, axis.y, 'mousemove');
      applyColorpicker(nativeElement, fixture);
      verifyColorpicker(nativeElement, '#285480', '40, 84, 128');

      openColorpicker(nativeElement, fixture);
      mouseHelper(axis.x + 50, axis.y, 'mouseup');
      applyColorpicker(nativeElement, fixture);
      verifyColorpicker(nativeElement, '#285480', '40, 84, 128');
    }));

    it('should output HSLA in css format.', fakeAsync(() => {
      component.selectedOutputFormat = 'hsla';
      openColorpicker(nativeElement, fixture);
      setInputElementValue(nativeElement, 'hex', '#123456');
      applyColorpicker(nativeElement, fixture);
      verifyColorpicker(nativeElement, 'hsla(210,65%,20%,1)', '18, 52, 86');
    }));

    it('should accept HEX8 alpha conversions.', fakeAsync(() => {
      component.selectedHexType = 'hex8';
      component.selectedOutputFormat = 'rgba';
      openColorpicker(nativeElement, fixture);
      setInputElementValue(nativeElement, 'hex', '#12345680');
      applyColorpicker(nativeElement, fixture);
      verifyColorpicker(nativeElement, 'rgba(18,52,86,0.5)', '18, 52, 86, 0.5');
    }));

    it('should output CMYK in css format.', fakeAsync(() => {
      component.selectedOutputFormat = 'cmyk';
      openColorpicker(nativeElement, fixture);
      setInputElementValue(nativeElement, 'hex', '#654321');
      applyColorpicker(nativeElement, fixture);
      verifyColorpicker(nativeElement, 'cmyk(0%,34%,67%,60%)', '101, 67, 33');
    }));

    it('should accept transparency', fakeAsync(() => {
      component.selectedOutputFormat = 'hsla';
      openColorpicker(nativeElement, fixture);
      setInputElementValue(nativeElement, 'red', '0');
      setInputElementValue(nativeElement, 'green', '0');
      setInputElementValue(nativeElement, 'blue', '0');
      setInputElementValue(nativeElement, 'alpha', '0');
      applyColorpicker(nativeElement, fixture);
      verifyColorpicker(nativeElement, 'hsla(0,0%,0%,0)', '0, 0, 0, 0');
    }));

    it('should accept color change through directive host listener', fakeAsync(() => {
      component.selectedOutputFormat = 'rgba';
      openColorpicker(nativeElement, fixture);
      nativeElement.querySelector('input').value = '#4523FC';
      let inputEvent = document.createEvent('Event');
      inputEvent.initEvent('input', true, false);
      let changeEvent = document.createEvent('Event');
      changeEvent.initEvent('change', true, false);
      nativeElement.querySelector('input').dispatchEvent(inputEvent);
      nativeElement.querySelector('input').dispatchEvent(changeEvent);
      fixture.detectChanges();
      applyColorpicker(nativeElement, fixture);
      verifyColorpicker(nativeElement, 'rgba(69,35,252,1)', '69, 35, 252');
    }));

    it('should allow user to esc cancel the color change.', fakeAsync(() => {
      component.selectedOutputFormat = 'hex';
      component.colorModel = '#2889e5';
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      openColorpicker(nativeElement, fixture);
      setInputElementValue(nativeElement, 'hex', '#086A93');
      keyHelper('Escape', 27, 'Esc');
      fixture.detectChanges();
      verifyColorpicker(nativeElement, '#2889e5', '40, 137, 229');
    }));

    it('should specify type="button" on all button elements.', fakeAsync(() => {
      component.selectedOutputFormat = 'hex';
      openColorpicker(nativeElement, fixture);
      expect(nativeElement.querySelectorAll('button:not([type="button"])').length).toBe(0);
    }));

    it('should hide when input type is set to hidden.', fakeAsync(() => {
      component.inputType = 'hidden';
      const directiveEl = fixture.debugElement.query(By.directive(SkyColorpickerInputDirective));
      const directiveInstance = directiveEl.injector.get(SkyColorpickerInputDirective);
      tick();
      fixture.detectChanges();
      directiveInstance.ngOnInit();
      tick();
      fixture.detectChanges();
      tick();
      openColorpicker(nativeElement, fixture);
      fixture.detectChanges();
      expect(nativeElement.querySelectorAll('.sky-colorpicker-hidden').length).toEqual(1);
    }));

    it('should show when input type is set to anything other than hidden.', fakeAsync(() => {
      const directiveEl = fixture.debugElement.query(By.directive(SkyColorpickerInputDirective));
      const directiveInstance = directiveEl.injector.get(SkyColorpickerInputDirective);
      tick();
      fixture.detectChanges();
      directiveInstance.ngOnInit();
      tick();
      fixture.detectChanges();
      tick();
      openColorpicker(nativeElement, fixture);
      fixture.detectChanges();
      expect(nativeElement.querySelectorAll('.sky-colorpicker-hidden').length).toEqual(0);
    }));

    it('should load with hidden reset button.', fakeAsync(() => {
      colorpickerComponent.showResetButton = false;
      tick();
      fixture.detectChanges();
      tick();
      expect(nativeElement.querySelectorAll('.sky-colorpicker-reset-button').length).toEqual(0);
      colorpickerComponent.showResetButton = true;
      tick();
      fixture.detectChanges();
      tick();
      expect(nativeElement.querySelectorAll('.sky-colorpicker-reset-button').length).toEqual(1);
    }));

    it('should reset colorpicker via reset button.', fakeAsync(() => {
      let spyOnResetColorPicker = spyOn(colorpickerComponent, 'resetPickerColor').and.callThrough();
      fixture.detectChanges();
      tick();
      openColorpicker(nativeElement, fixture);
      setPresetColor(nativeElement, fixture, 4);
      fixture.detectChanges();
      tick();
      const buttonElem = nativeElement.querySelector('.sky-colorpicker-reset-button') as HTMLElement;
      buttonElem.click();
      tick();
      fixture.detectChanges();
      expect(spyOnResetColorPicker).toHaveBeenCalled();
      verifyColorpicker(nativeElement, 'rgba(40,137,229,1)', '40, 137, 229');
    }));

    it('should accept open colorpicker via messageStream.', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      component.sendMessage(SkyColorpickerMessageType.Open);
      tick();
      fixture.detectChanges();
      tick();
      verifyMenuVisibility();
    }));

    it('should accept reset colorpicker via messageStream.', fakeAsync(() => {
      component.colorModel = 'rgba(40,137,229,1)';
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      verifyColorpicker(nativeElement, 'rgba(40,137,229,1)', '40, 137, 229');
      tick();
      openColorpicker(nativeElement, fixture);
      setPresetColor(nativeElement, fixture, 4);
      fixture.detectChanges();
      tick();
      component.sendMessage(SkyColorpickerMessageType.Reset);
      tick();
      fixture.detectChanges();
      tick();
      verifyColorpicker(nativeElement, 'rgba(40,137,229,1)', '40, 137, 229');
    }));

    it('should toggle reset button via messageStream.', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      expect(nativeElement.querySelectorAll('.sky-colorpicker-reset-button').length).toEqual(1);
      component.sendMessage(SkyColorpickerMessageType.ToggleResetButton);
      tick();
      fixture.detectChanges();
      tick();
      expect(nativeElement.querySelectorAll('.sky-colorpicker-reset-button').length).toEqual(0);
      component.sendMessage(SkyColorpickerMessageType.ToggleResetButton);
      tick();
      fixture.detectChanges();
      tick();
      expect(nativeElement.querySelectorAll('.sky-colorpicker-reset-button').length).toEqual(1);
    }));

    it('should display alpha related elements by default', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      openColorpicker(nativeElement, fixture);

      const alphaBar = fixture.debugElement.query(By.css('.alpha'));

      expect(alphaBar).toBeTruthy();

      const selector = `#${component.colorpickerComponent.skyColorpickerAlphaId}`;
      const alphaInput = fixture.debugElement.query(By.css(selector));

      expect(alphaInput).toBeTruthy();
    }));

    it('should not display alpha related elements when allowTransparency is specified', fakeAsync(() => {
      component.selectedTransparency = false;
      fixture.detectChanges();

      openColorpicker(nativeElement, fixture);

      const alphaBar = fixture.debugElement.query(By.css('.alpha'));

      expect(alphaBar).toBeFalsy();

      const selector = `#${component.colorpickerComponent.skyColorpickerAlphaId}`;
      const alphaInput = fixture.debugElement.query(By.css(selector));

      expect(alphaInput).toBeFalsy();
    }));

  });

  describe('reactive configuration', () => {

    let component: ColorpickerReactiveTestComponent;

    beforeEach(() => {
      fixture = TestBed.createComponent(ColorpickerReactiveTestComponent);
      nativeElement = fixture.nativeElement as HTMLElement;
      component = fixture.componentInstance;
      colorpickerComponent = component.colorpickerComponent;
    });

    it('should populate correct information if model is given', fakeAsync(() => {
      component.initialColor = undefined;
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      expect(component.colorpickerComponent.initialColor).toBe('#00f');
      expect(component.colorpickerComponent.lastAppliedColor).toEqual('#00f');
    }));

    it('should populate correct information if model is given but an initfial color is also given', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      expect(component.colorpickerComponent.initialColor).toBe('#2889e5');
      expect(component.colorpickerComponent.lastAppliedColor).toEqual('#00f');
    }));

    it('should allow user to click cancel the color change.', fakeAsync(() => {
      component.selectedOutputFormat = 'hex';
      fixture.detectChanges();
      component.colorControl.setValue('#2889e5');
      openColorpicker(nativeElement, fixture);
      setInputElementValue(nativeElement, 'hex', '#BFF666');
      closeColorpicker(nativeElement, fixture);
      verifyColorpicker(nativeElement, '#2889e5', '40, 137, 229');
    }));

    it('should use the last applied color to revert to on cancel', fakeAsync(() => {
      component.selectedOutputFormat = 'hex';
      fixture.detectChanges();
      tick();
      component.colorControl.setValue('#2889e5');
      fixture.detectChanges();
      verifyColorpicker(nativeElement, '#2889e5', '40, 137, 229');
      openColorpicker(nativeElement, fixture);
      setInputElementValue(nativeElement, 'hex', '#2B7230');
      applyColorpicker(nativeElement, fixture);
      verifyColorpicker(nativeElement, '#2b7230', '43, 114, 48');
      openColorpicker(nativeElement, fixture);
      setInputElementValue(nativeElement, 'hex', '#BFF666');
      closeColorpicker(nativeElement, fixture);
      verifyColorpicker(nativeElement, '#2b7230', '43, 114, 48');
    }));

    it('should allow user to click apply the color change.', fakeAsync(() => {
      component.selectedOutputFormat = 'hex';
      fixture.detectChanges();
      openColorpicker(nativeElement, fixture);
      setInputElementValue(nativeElement, 'hex', '#2B7230');
      applyColorpicker(nativeElement, fixture);
      verifyColorpicker(nativeElement, '#2b7230', '43, 114, 48');
    }));

    it('should reset colorpicker via reset button.', fakeAsync(() => {
      fixture.detectChanges();
      let spyOnResetColorPicker = spyOn(colorpickerComponent, 'resetPickerColor').and.callThrough();
      fixture.detectChanges();
      tick();
      openColorpicker(nativeElement, fixture);
      setPresetColor(nativeElement, fixture, 4);
      fixture.detectChanges();
      tick();
      const buttonElem = nativeElement.querySelector('.sky-colorpicker-reset-button') as HTMLElement;
      buttonElem.click();
      tick();
      fixture.detectChanges();
      expect(spyOnResetColorPicker).toHaveBeenCalled();
      verifyColorpicker(nativeElement, 'rgba(40,137,229,1)', '40, 137, 229');
    }));

    it('should accept open colorpicker via messageStream.', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      component.sendMessage(SkyColorpickerMessageType.Open);
      tick();
      fixture.detectChanges();
      tick();
      verifyMenuVisibility();
    }));

    it('should accept reset colorpicker via messageStream.', fakeAsync(() => {
      component.colorControl.setValue('rgba(40,137,229,1)');
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      verifyColorpicker(nativeElement, 'rgba(40,137,229,1)', '40, 137, 229');
      tick();
      openColorpicker(nativeElement, fixture);
      setPresetColor(nativeElement, fixture, 4);
      fixture.detectChanges();
      tick();
      component.sendMessage(SkyColorpickerMessageType.Reset);
      tick();
      fixture.detectChanges();
      tick();
      verifyColorpicker(nativeElement, 'rgba(40,137,229,1)', '40, 137, 229');
    }));

    it('should toggle reset button via messageStream.', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      expect(nativeElement.querySelectorAll('.sky-colorpicker-reset-button').length).toEqual(1);
      component.sendMessage(SkyColorpickerMessageType.ToggleResetButton);
      tick();
      fixture.detectChanges();
      tick();
      expect(nativeElement.querySelectorAll('.sky-colorpicker-reset-button').length).toEqual(0);
      component.sendMessage(SkyColorpickerMessageType.ToggleResetButton);
      tick();
      fixture.detectChanges();
      tick();
      expect(nativeElement.querySelectorAll('.sky-colorpicker-reset-button').length).toEqual(1);
    }));

    it('should only emit the form control valueChanged event once per change', (done) => {
      fixture.detectChanges();
      let callback = function() {};
      let callbackSpy = jasmine.createSpy('callback', callback);
      component.colorForm.valueChanges.subscribe(() => { callbackSpy(); });
      // This will give us 10 milliseconds pause before emitting the final valueChanges event that
      // was fired. Testing was done to ensure this was enough time to catch any bad behavior
      component.colorForm.valueChanges.sampleTime(10).subscribe(() => {
        expect(callbackSpy).toHaveBeenCalledTimes(1);
        done();
      });
      component.colorForm.setValue(component.newValues);
    });

  });

});
