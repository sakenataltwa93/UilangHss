document.addEventListener("DOMContentLoaded", () => {
  // Interface for parsed instruction parts
  interface InstructionParts {
    clickSelector: string;
    classBehavior: string;
    classValue: string;
    targetSelector?: string;
  }

  // Class to parse instruction string into parts
  class InstructionParser implements InstructionParts {
    clickSelector: string;
    classBehavior: string;
    classValue: string;
    targetSelector?: string;

    constructor(instruction: string) {
      // The instruction string starts with a delimiter character, e.g. "/"
      const delimiter = instruction.charAt(0);
      const parts = instruction.split(delimiter);

      this.clickSelector = parts[1];
      // Trim and get first word for class behavior
      this.classBehavior = parts[2].trim().split(" ")[0];
      this.classValue = parts[3];
      this.targetSelector = parts[5];
    }
  }

  // Class to create event listeners based on parsed instructions
  class ClickClassToggler {
    clickSelector: string;
    classBehavior: string;
    classValue: string;
    targetSelector?: string;

    constructor(clickSelector: string, classBehavior: string, classValue: string, targetSelector?: string) {
      this.clickSelector = clickSelector;
      // Remove trailing 's' if present for class behavior (e.g., 'adds' -> 'add')
      this.classBehavior = classBehavior.endsWith("s") ? classBehavior.slice(0, -1) : classBehavior;
      // Remove leading '.' from classValue if present
      this.classValue = classValue.startsWith(".") ? classValue.slice(1) : classValue;
      this.targetSelector = targetSelector;
      this.createEventListener();
    }

    private createEventListener(): void {
      const handler = (event: Event) => {
        const target = event.target as HTMLElement;

        switch (this.targetSelector) {
          case "target":
          case "this":
          case "it":
          case "itself":
          case undefined:
            target.classList[this.classBehavior as keyof DOMTokenList](this.classValue);
            break;
          default:
            const elements = document.querySelectorAll<HTMLElement>(this.targetSelector);
            elements.forEach(el => el.classList[this.classBehavior as keyof DOMTokenList](this.classValue));
            break;
        }

        // Prevent default if the clicked element is an anchor tag
        if (target.nodeName.toLowerCase() === "a") {
          event.preventDefault();
        }
      };

      const clickableElements = document.querySelectorAll<HTMLElement>(this.clickSelector);

      if (clickableElements.length === 0) {
        throw new Error(`There's no element matching your "${this.clickSelector}" CSS selector.`);
      }

      clickableElements.forEach(el => el.addEventListener("click", handler));
    }
  }

  // Find the <code> element containing the instruction text starting with "clicking on"
  const codeElements = document.getElementsByTagName("code");
  let instructionElement: HTMLElement | null = null;
  let instructionText: string | null = null;

  for (let i = 0; i < codeElements.length; i++) {
    const el = codeElements[i];
    const text = el.textContent?.trim() ?? "";
    if (text.startsWith("clicking on")) {
      instructionElement = el;
      instructionText = text;
      break;
    }
  }

  if (instructionElement && instructionText) {
    // Remove the instruction element from DOM
    instructionElement.parentNode?.removeChild(instructionElement);

    // Split the instructions by "clicking on" and process each
    instructionText.split("clicking on").forEach(instruction => {
      const trimmed = instruction.trim();
      if (trimmed) {
        const parsed = new InstructionParser(trimmed);
        new ClickClassToggler(parsed.clickSelector, parsed.classBehavior, parsed.classValue, parsed.targetSelector);
      }
    });
  }
});
