import clsx, { ClassValue } from 'clsx';
import { CSSProperties, Elements, Variables } from '../context';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function generateRandomString(length: number): string {
  const characters = 'abcdefghijklmnopqrstuvwxyz';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

function generateUniqueRandomString(set: Set<string>, length: number): string {
  let randomString: string;
  do {
    randomString = generateRandomString(length);
  } while (set.has(randomString));

  return randomString;
}

export function getNestedProperty<T>(obj: T, path: string): any {
  const keys = path.split('.');

  return keys.reduce((accumulator: any, key: string) => {
    return accumulator && key in accumulator ? accumulator[key] : undefined;
  }, obj);
}

export function cssObjectToString(styles: CSSProperties): string {
  return Object.entries(styles)
    .map(([key, value]) => {
      const kebabKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();

      return `${kebabKey}: ${value};`;
    })
    .join(' ');
}

export function createClassAndRuleFromCssString(classNameSet: Set<string>, styles: string) {
  const className = `novu-css-${generateUniqueRandomString(classNameSet, 8)}`;
  const rule = `.${className} { ${styles} }`;
  //add to set to avoid generating the same class again
  classNameSet.add(className);

  return { className, rule };
}

const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
export function generateDefaultColor(props: { color: string; key: string; id: string }) {
  const cssVariableDefaultRule = `.${props.id} { --nv-${props.key}: oklch(from ${props.color} l c h); }`;

  return cssVariableDefaultRule;
}

export function generatesSolidShadesFromColor(props: { color: string; key: string; id: string }) {
  const rules = [];
  for (let i = 0; i < shades.length; i++) {
    const shade = shades[i];
    const cssVariableSolidRule = `.${props.id} { --nv-${props.key}-${shade}: oklch(from ${props.color} calc(l - ${
      (shade - 500) / 1000
    }) c h); }`;
    rules.push(cssVariableSolidRule);
  }

  return rules;
}

export function generatesAlphaShadesFromColor(props: { color: string; key: string; id: string }) {
  const rules = [];
  for (let i = 0; i < shades.length; i++) {
    const shade = shades[i];
    const cssVariableAlphaRule = `.${props.id} { --nv-${props.id}-${shade}: oklch(from ${props.color} l c h / ${
      shade / 1000
    }); }`;
    rules.push(cssVariableAlphaRule);
  }

  return rules;
}

export const parseVariables = (variables: Required<Variables>, id: string) => {
  return [
    generateDefaultColor({ color: variables.colorBackground, key: 'color-background', id }),
    generateDefaultColor({ color: variables.colorForeground, key: 'color-foreground', id }),
    generateDefaultColor({ color: variables.colorPrimary, key: 'color-primary', id }),
    generateDefaultColor({ color: variables.colorPrimaryForeground, key: 'color-primary-foreground', id }),
    generateDefaultColor({ color: variables.colorSecondary, key: 'color-secondary', id }),
    generateDefaultColor({ color: variables.colorSecondaryForeground, key: 'color-secondary-foreground', id }),
    ...generatesAlphaShadesFromColor({ color: variables.colorBackground, key: 'color-background-alpha', id }),
    ...generatesAlphaShadesFromColor({ color: variables.colorForeground, key: 'color-foreground-alpha', id }),
    ...generatesSolidShadesFromColor({ color: variables.colorPrimary, key: 'color-primary', id }),
    ...generatesAlphaShadesFromColor({ color: variables.colorPrimary, key: 'color-primary-alpha', id }),
    ...generatesAlphaShadesFromColor({
      color: variables.colorPrimaryForeground,
      key: 'color-primary-foreground-alpha',
      id,
    }),
    ...generatesSolidShadesFromColor({ color: variables.colorSecondary, key: 'color-secondary', id }),
    ...generatesAlphaShadesFromColor({ color: variables.colorSecondary, key: 'color-secondary-alpha', id }),
    ...generatesAlphaShadesFromColor({
      color: variables.colorSecondaryForeground,
      key: 'color-secondary-foreground-alpha',
      id,
    }),
    ...generatesAlphaShadesFromColor({ color: variables.colorNeutral, key: 'color-neutral-alpha', id }),
  ];
};

export const parseElements = (elements: Elements) => {
  const elementsStyleData: { key: string; rule: string; className: string }[] = [];
  const generatedClassNames = new Set<string>();
  for (const key in elements) {
    if (elements.hasOwnProperty(key)) {
      const value = elements[key as keyof Elements];
      if (typeof value === 'object') {
        // means it is css in js object
        const cssString = cssObjectToString(value);
        const { className, rule } = createClassAndRuleFromCssString(generatedClassNames, cssString);
        elementsStyleData.push({ key, rule, className });
      }
    }
  }

  return elementsStyleData;
};
