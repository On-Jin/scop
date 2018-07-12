#include "scop_nk.h"
#include "scop.h"

void 				nk_m_shader(t_nk *nk, t_m_shader *m_shader)
{
	struct nk_context		*ctx;

	ctx = nk->ctx;
	if (nk_tree_push(ctx, NK_TREE_TAB, "Shader", NK_MAXIMIZED))
	{
		nk_layout_row_static(ctx, 25, 150, 1);

		m_shader->index_selected = nk_combo(ctx,
								(const char **)m_shader->shader_name,
								m_shader->size,
								m_shader->index_selected,
								25, nk_vec2(200,200));
		/*
		nk_model(nk, m_model->model[m_model->index_selected]);
		*/
		nk_tree_pop(ctx);
	}
}
