# sml-recommender-sdk
 Kit de desenvolvimento feito para facilitar o processo de gerar recomendações de imóveis para leads.

### Funcionalidades

- [x] Recomendação de imóveis para leads
- [x] Descobrir imóveis semelhantes baseado nas características
- [ ] Imóveis semelhantes baseado em descrições usando TF-IDF

#### Como usar:　

```javascript
import { Factory } from 'sml-recommender-sdk'

const factory1 = new Factory({ imoveis: [...] })

// Array de [id, % de semelhanca], quanto maior a semelhança melhor a recomendação
const { ids_with_simi } = factory1.imoveis_recomendados_para_visitante(visitante)
```