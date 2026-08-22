/**
 * @dsh-model-search — Client half.
 *
 * Registers a 🔍 search button in conversation.input.right (session-scoped).
 * Opens a popup that fetches all models via the Host API and filters in real time.
 * Selecting a model calls connection.api.sessions.selectModel to switch the
 * current session's model immediately.
 */
window.__ModuleLoader__.load({
  id: 'dsh-model-search',
  factory: (require) => {
    const module = { exports: {} }
    const exports = module.exports
    const React = require('react')

    const inject = ['slots']
    const API_BASE = '/model-search/api'

    // Will be set by apply() when connection is available
    var doSelectModel = null

    function apply(ctx) {
      // Get the connection service to call session.selectModel directly
      ctx.inject(['connection', 'sessions'], (scope) => {
        const connection = scope.get('connection')
        if (!connection) return

        doSelectModel = async (sessionId, providerId, modelName) => {
          try {
            const result = await connection.api.sessions.selectModel({
              sessionId: sessionId,
              provider: providerId,
              model: modelName
            })
            return result && result.ok
          } catch (e) {
            console.error('[model-search] selectModel failed:', e)
            return false
          }
        }
      })

      // Add a search button in the input bar (session-scoped, has sessionId)
      ctx.slots.inject('conversation.input.right', () => ctx.slots.register({
        name: 'conversation.input.right',
        id: 'dsh-model-search-button',
        label: () => '搜索模型'
      }, SearchButton))
    }

    function SearchButton(props) {
      const [isOpen, setIsOpen] = React.useState(false)
      const [models, setModels] = React.useState([])
      const [searchText, setSearchText] = React.useState('')
      const [loading, setLoading] = React.useState(false)
      const [selected, setSelected] = React.useState(null)
      const ref = React.useRef(null)
      const sessionId = props.sessionId

      // Fetch models when opened
      React.useEffect(() => {
        if (!isOpen) return
        setLoading(true)
        fetch(API_BASE + '/models')
          .then(r => r.json())
          .then(data => {
            if (data.ok && Array.isArray(data.models)) {
              setModels(data.models)
            }
            setLoading(false)
          })
          .catch(() => setLoading(false))
      }, [isOpen])

      // Close on click outside
      React.useEffect(() => {
        if (!isOpen) return
        function handleClick(e) {
          if (ref.current && !ref.current.contains(e.target)) {
            setIsOpen(false)
          }
        }
        setTimeout(() => document.addEventListener('mousedown', handleClick), 0)
        return () => document.removeEventListener('mousedown', handleClick)
      }, [isOpen])

      // Filter models
      const filtered = React.useMemo(() => {
        if (!searchText) return models
        const q = searchText.toLocaleLowerCase()
        return models.filter(m =>
          m.name.toLocaleLowerCase().indexOf(q) !== -1 ||
          m.provider.toLocaleLowerCase().indexOf(q) !== -1
        )
      }, [models, searchText])

      function handleSelect(m) {
        setSelected(m)
        var p = m.providerId || m.provider
        if (doSelectModel && sessionId) {
          doSelectModel(sessionId, p, m.name).then(function(ok) {
            if (ok) {
              setSearchText('')
              setModels([])
              setIsOpen(false)
            } else {
              fetch(API_BASE + '/switch-model', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ provider: m.provider, providerId: p, model: m.name })
              })
            }
          })
        } else {
          fetch(API_BASE + '/switch-model', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ provider: m.provider, providerId: p, model: m.name })
          })
        }
      }

      return React.createElement(React.Fragment, null,
        // Search button in the input bar
        React.createElement('button', {
          onClick: function() { setIsOpen(!isOpen); },
          style: {
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '28px', height: '28px',
            border: 'none', borderRadius: '6px',
            cursor: 'pointer',
            background: 'transparent',
            color: 'var(--dsw-alias-label-secondary, #666)',
            fontSize: '14px',
            padding: 0
          },
          title: '\u641C\u7D22\u6A21\u578B'
        }, '\uD83D\uDD0D'),
        // Search popup
        isOpen ? React.createElement('div', {
          ref: ref,
          style: {
            position: 'fixed',
            bottom: '60px',
            right: '80px',
            zIndex: 10000,
            width: '360px',
            maxHeight: '480px',
            background: 'var(--dsw-specific-menu, #fff)',
            border: '1px solid var(--dsw-alias-border-inverted, #ddd)',
            borderRadius: '12px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }
        },
          React.createElement('div', {
            style: {
              padding: '12px 12px 8px',
              fontWeight: 600,
              fontSize: '14px',
              color: 'var(--dsw-alias-label-primary, #333)',
              borderBottom: '1px solid var(--dsw-alias-border-subtle, #eee)'
            }
          }, '\u641C\u7D22\u6A21\u578B'),
          React.createElement('input', {
            type: 'text',
            value: searchText,
            onChange: function(e) { setSearchText(e.target.value); },
            placeholder: '\u8F93\u5165\u6A21\u578B\u540D\u79F0\u7B5B\u9009\uFF0C\u5982 qwen3.8',
            autoFocus: true,
            style: {
              margin: '8px 12px',
              padding: '8px 10px',
              border: '1px solid var(--dsw-alias-border-l2, #ddd)',
              borderRadius: '8px',
              fontSize: '13px',
              outline: 'none',
              background: 'var(--dsw-alias-bg-input, #f5f5f5)',
              color: 'var(--dsw-alias-label-primary, #333)'
            }
          }),
          React.createElement('div', {
            style: { flex: 1, overflowY: 'auto', padding: '0 12px 12px' }
          },
            loading ? React.createElement('div', {
              style: { padding: '20px', textAlign: 'center', color: '#999', fontSize: '13px' }
            }, '\u52A0\u8F7D\u4E2D...') : null,
            !loading && filtered.length === 0 ? React.createElement('div', {
              style: { padding: '20px', textAlign: 'center', color: '#999', fontSize: '13px' }
            }, '\u6CA1\u6709\u5339\u914D\u7684\u6A21\u578B') : null,
            !loading ? filtered.map(function(m, i) {
              return React.createElement('div', {
                key: m.provider + '/' + m.name + '/' + i,
                onClick: function() { handleSelect(m); },
                style: {
                  padding: '8px 10px', cursor: 'pointer', borderRadius: '6px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  fontSize: '13px',
                  borderBottom: '1px solid var(--dsw-alias-border-subtle, #f0f0f0)',
                  background: selected && selected.name === m.name && selected.provider === m.provider
                    ? 'var(--dsw-alias-interactive-bg-hover, #e8e8e8)' : 'transparent'
                },
                onMouseEnter: function(e) { e.currentTarget.style.background = 'var(--dsw-alias-interactive-bg-hover, #f0f0f0)'; },
                onMouseLeave: function(e) {
                  if (!(selected && selected.name === m.name && selected.provider === m.provider)) {
                    e.currentTarget.style.background = 'transparent'
                  }
                }
              },
                React.createElement('div', { style: { fontWeight: 500, color: 'var(--dsw-alias-label-primary, #333)', fontSize: '13px' } },
                    m.provider + '  ' + m.name
                  ),
                selected && selected.name === m.name && selected.provider === m.provider
                  ? React.createElement('span', { style: { color: 'var(--dsw-alias-brand-primary, #4f6ef7)', fontSize: '14px' } }, '\u2713')
                  : null
              )
            }) : null
          )
        ) : null
      )
    }

    module.exports = { apply, inject }
    return module.exports
  }
})