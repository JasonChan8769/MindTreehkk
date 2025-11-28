
import { SAFETY_PATTERNS } from '../constants';
import { SafetyCheckResult } from '../types';

export const checkContentSafety = (text: string): SafetyCheckResult => {
  // Check Privacy
  for (const rule of SAFETY_PATTERNS.privacy) {
    if (rule.regex.test(text)) return { safe: false, reason: rule.warning, type: rule.type as any };
  }
  
  // Check Offensive
  for (const rule of SAFETY_PATTERNS.offensive) {
    if (rule.regex.test(text)) return { safe: false, reason: rule.warning, type: rule.type as any };
  }

  // Check Illegal
  if (SAFETY_PATTERNS.illegal) {
    for (const rule of SAFETY_PATTERNS.illegal) {
        if (rule.regex.test(text)) return { safe: false, reason: rule.warning, type: rule.type as any };
    }
  }

  // Check Promotional
  if (SAFETY_PATTERNS.promotional) {
    for (const rule of SAFETY_PATTERNS.promotional) {
      if (rule.regex.test(text)) return { safe: false, reason: rule.warning, type: 'promotional' };
    }
  }
  return { safe: true };
};
