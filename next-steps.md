# Next Steps: Editor Node Scaffolding

## Overview
Plan to scaffold intelligent nodes for the React Flow editor with dynamic OpenRouter AI model integration. The system will use Clerk private metadata for secure API key storage and dynamically generate node capabilities based on real AI model specifications.

## Architecture Decisions

### API Key Management
- **Storage**: Clerk private metadata (no database storage of sensitive data)
- **Location**: Integrated into existing `user-profile-dialog.tsx`
- **Validation**: Real-time validation against OpenRouter API
- **Security**: Never exposed client-side, automatic encryption via Clerk

### Model Caching Strategy
- **Approach**: Fresh fetch each time using user's OpenRouter API key
- **Benefits**: Real-time pricing, availability, and model capabilities
- **Simplicity**: No cache invalidation complexity

### Connection Intelligence
- **Strategy**: Flexible with warnings
- **Allow**: "Maybe compatible" connections with visual feedback
- **Guide**: Users toward working configurations without blocking experimentation

### Model Selection UX
- **Component**: Shadcn Combobox
- **Features**: Searchable, categorized by modalities, pricing display, performance indicators

## File Structure (Kebab-Case Convention)

```
src/app/_components/editor/nodes/
├── base/
│   ├── base-node.tsx          # Base node component
│   ├── dynamic-handles.tsx    # Dynamic handle generation
│   └── types.ts               # Shared types
├── input/
│   ├── text-input-node.tsx
│   ├── file-input-node.tsx
│   ├── image-input-node.tsx
│   └── url-input-node.tsx
├── model/
│   ├── model-node.tsx
│   ├── model-combobox.tsx     # Shadcn combobox for model selection
│   ├── model-config.tsx       # Dynamic parameter configuration
├── output/
│   ├── text-output-node.tsx
│   ├── image-output-node.tsx
│   └── file-output-node.tsx
├── operator/
│   ├── merge-node.tsx
│   └── diff-node.tsx
├── services/
│   ├── openrouter.ts          # Fresh fetch service
│   └── clerk-metadata.ts      # API key management
└── index.ts                   # Export all node types
```

## Node Types to Support

### Input Nodes
- **Text Input**: Text content with format options
- **File Input**: File upload with type validation
- **Image Input**: Image upload with format support
- **URL Input**: URL input with validation

### Model Node
- **Dynamic Model Selection**: Combobox with all available OpenRouter models
- **Smart Handle Generation**: Input/output handles based on model capabilities
- **Configuration**: Dynamic parameters based on model's `supported_parameters`
- **Pricing Display**: Real-time cost information

### Output Nodes
- **Text Output**: Text display with format/export options
- **Image Output**: Image generation output display
- **File Output**: File export options

### Operator Nodes
- **Merge**: Smart merging based on data types
- **Diff**: Intelligent diffing between inputs

## OpenRouter Integration

### Model Manifest Service
```typescript
export interface OpenRouterModel {
  id: string;
  name: string;
  description: string;
  architecture: {
    input_modalities: string[];    // ["text", "image"]
    output_modalities: string[];   // ["text"]
    tokenizer: string;
  };
  pricing: {
    prompt: string;
    completion: string;
    image: string;
    // ... other pricing fields
  };
  context_length: number;
  supported_parameters: string[];
}
```

### Dynamic Handle Generation
- **Input Handles**: Generated based on `input_modalities`
- **Output Handles**: Generated based on `output_modalities`
- **Smart Positioning**: Automatic handle positioning to avoid overlap
- **Connection Validation**: Type-aware connection rules

## Enhanced User Profile Dialog

### API Key Management Integration
- Load current API key from Clerk private metadata on dialog open
- Real-time validation as user types (with debouncing)
- Visual feedback with existing status dot system
- Automatic saving to Clerk private metadata
- Error handling for invalid keys

### API Routes Required
```
POST /api/user/openrouter-key    # Save/update API key
GET /api/user/openrouter-key     # Check if user has API key
DELETE /api/user/openrouter-key  # Remove API key
```

## Model Combobox Features

### Search & Filter
- Searchable model names and descriptions
- Filter by input/output modalities
- Sort by pricing, context length, popularity

### Display Information
- Model name and description
- Input/output modality badges
- Pricing per 1K tokens
- Context length limits
- Performance indicators

### Example Structure
```typescript
<CommandItem key={model.id} value={model.id}>
  <div className="flex flex-col">
    <div className="flex items-center justify-between">
      <span>{model.name}</span>
      <Badge variant="secondary">
        ${model.pricing.prompt}/1K tokens
      </Badge>
    </div>
    <div className="flex gap-1 mt-1">
      {model.architecture.input_modalities.map((modality) => (
        <Badge key={modality} variant="outline" className="text-xs">
          {modality}
        </Badge>
      ))}
      <span className="text-xs text-muted-foreground">→</span>
      {model.architecture.output_modalities.map((modality) => (
        <Badge key={modality} variant="outline" className="text-xs">
          {modality}
        </Badge>
      ))}
    </div>
  </div>
</CommandItem>
```

## Node Type Registration

### Updated Editor Integration
```typescript
import {
  TextInputNode,
  FileInputNode,
  ImageInputNode,
  URLInputNode,
  ModelNode,
  TextOutputNode,
  ImageOutputNode,
  FileOutputNode,
  MergeNode,
  DiffNode,
} from './nodes';

const nodeTypes = {
  'input-text': TextInputNode,
  'input-file': FileInputNode,
  'input-image': ImageInputNode,
  'input-url': URLInputNode,
  'model': ModelNode,
  'output-text': TextOutputNode,
  'output-image': ImageOutputNode,
  'output-file': FileOutputNode,
  'operator-merge': MergeNode,
  'operator-diff': DiffNode,
};
```

### Command Menu Updates
Update existing command menu to create nodes with correct types instead of generic ones.

## Implementation Priority

### Phase 1: Foundation
1. **Enhance user-profile-dialog.tsx** with Clerk private metadata integration
2. **Create API routes** for OpenRouter key management
3. **Build base node structure** and shared types
4. **Implement OpenRouter service** for model fetching

### Phase 2: Core Nodes
1. **Create ModelNode** with combobox selection
2. **Implement dynamic handle generation**
3. **Build basic input nodes** (text, file, image, url)
4. **Build basic output nodes** (text, image, file)

### Phase 3: Advanced Features
1. **Add operator nodes** (merge, diff)
2. **Implement connection validation**
3. **Add model configuration panels**
4. **Enhance error handling and user feedback**

### Phase 4: Polish
1. **Add loading states and animations**
2. **Implement comprehensive error handling**
3. **Add tooltips and help text**
4. **Performance optimization**

## Technical Considerations

### Next.js SSR Strategy
- **Client-Side**: Interactive editor, real-time model selection, dynamic handles
- **Server-Side**: API key validation, model manifest preprocessing (if needed)

### Type Safety
- Comprehensive TypeScript interfaces for all node data
- Proper typing for OpenRouter API responses
- Type-safe connection validation

### Error Handling
- Graceful degradation when API key is missing/invalid
- Clear error messages for connection issues
- Fallback UI states for loading/error conditions

### Performance
- Debounced API key validation
- Efficient model list filtering
- Optimized re-renders for dynamic handles

## Dependencies to Add
```json
{
  "axios": "^1.6.0"  // For OpenRouter API calls
}
```

## Environment Variables
```env
# No additional env vars needed - using Clerk private metadata
```

## Security Considerations
- API keys stored only in Clerk private metadata
- Server-side validation of API keys
- No sensitive data in client-side code
- Proper error handling to avoid information leakage

## Future Enhancements
- Model performance analytics
- Usage tracking and cost monitoring
- Custom model configurations
- Workflow templates
- Collaborative editing features
- Export/import functionality

---

This plan provides a comprehensive foundation for building an intelligent, dynamic node-based editor that adapts to real AI model capabilities while maintaining security and user experience best practices.
