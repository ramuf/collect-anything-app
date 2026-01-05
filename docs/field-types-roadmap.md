# Form Field Types Roadmap

## Currently Implemented (from PRD.md)
- Text
- Textarea
- Number
- Date
- Select
- Radio
- Checkbox
- Toggle
- Time
- Reference

## ✅ Recently Implemented (High Priority)
- **Calculated** - Auto-compute values from other fields using formulas like `{price} * {quantity}`
- **Conditional** - Show/hide fields based on conditions (equals, not_equals, contains, greater_than, less_than, is_empty, is_not_empty)
- **Multi-select** - Select multiple options with tag-style UI
- **Section** - Group related fields with collapsible headers

---

## Missing from PRD.md
1. **File** - File upload attachments

---

## Advanced Field Types to Consider

### Calculated/Dynamic Fields
| Field Type | Description |
|------------|-------------|
| Calculated | Auto-compute values from other fields (formulas, sums, averages) |
| Conditional/Dependent | Show/hide based on other field values |
| Lookup | Pull data from other forms/submissions |

### Input Enhancements
| Field Type | Description |
|------------|-------------|
| Email | Email validation |
| Phone | Phone number with formatting |
| URL | Website links |
| Currency | Money with formatting |
| Slider/Range | Numeric range selector |
| Rating | Star/emoji ratings |
| Color Picker | Color selection |
| Time | Time-only input (vs datetime) |
| DateTime | Combined date + time |

### Multi-value/Complex
| Field Type | Description |
|------------|-------------|
| Multi-select | Select multiple options (vs single select) |
| Tags | Free-form tagging |
| Matrix/Grid | Table-style questions (rows × columns) |
| Repeater/Array | Add multiple entries of a field group |

### Rich Content
| Field Type | Description |
|------------|-------------|
| Rich Text | WYSIWYG editor |
| Signature | Digital signature capture |
| Location/GPS | Geolocation coordinates |
| Barcode/QR Scanner | Scan codes |

### Layout/Display (Non-input)
| Field Type | Description |
|------------|-------------|
| Section/Group | Group related fields |
| Heading | Display-only headers |
| Paragraph/Instructions | Static text/help |
| Divider | Visual separator |
| Hidden | Hidden values (for tracking) |

---

## Priority Recommendations

### High Priority (Most Impactful)
1. **File** - Required by PRD
2. ~~**Calculated** - Essential for data collection workflows~~ ✅ DONE
3. ~~**Conditional** - Dynamic form experiences~~ ✅ DONE
4. ~~**Multi-select** - Common use case~~ ✅ DONE
5. ~~**Section/Group** - Better form organization~~ ✅ DONE

### Medium Priority
6. **Repeater/Array** - Complex data entry
7. **Email/Phone/URL** - Input validation improvements
8. **Rating** - Quick feedback collection
9. **DateTime** - Full timestamp capture

### Lower Priority (Nice to Have)
10. **Signature** - Specialized use cases
11. **Location/GPS** - Mobile-focused
12. **Matrix/Grid** - Survey-style forms
13. **Barcode/QR** - Inventory/asset tracking

---

*Last updated: December 2, 2025*
