import { Link } from "react-router-dom";
import { useTema } from "../context/ThemeContext";

export default function PrivacidadePage() {
  const { tema } = useTema();
  const escuro = tema === "escuro";
  const Y = new Date().getFullYear();

  const cor = {
    bg: escuro ? "#0D1820" : "#F5F9FF",
    card: escuro ? "#1A2B3C" : "#FFFFFF",
    borda: escuro ? "#1A3347" : "#EEF5FF",
    titulo: escuro ? "#E0F0FF" : "#1A2B3C",
    texto: escuro ? "#8AAABB" : "#4A6070",
    destaque: "#00D4AA",
    link: "#4A90E2",
    alerta: escuro ? "#2A1A0A" : "#FFF8F0",
    alertaBorda: "#F59E0B",
  };

  const Section = ({ titulo, badge, children }) => (
    <section style={{ marginBottom: "32px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "12px",
          borderBottom: `1px solid ${cor.borda}`,
          paddingBottom: "8px",
        }}
      >
        <h2
          style={{
            fontSize: "16px",
            fontWeight: 700,
            color: cor.destaque,
            margin: 0,
          }}
        >
          {titulo}
        </h2>
        {badge && (
          <span
            style={{
              padding: "2px 10px",
              background: escuro ? "#0A1A2F" : "#F0F4FF",
              border: "1px solid #4A90E2",
              borderRadius: "999px",
              fontSize: "10px",
              fontWeight: 700,
              color: "#4A90E2",
            }}
          >
            {badge}
          </span>
        )}
      </div>
      {children}
    </section>
  );

  const P = ({ children }) => (
    <p
      style={{
        fontSize: "14px",
        color: cor.texto,
        lineHeight: "1.75",
        marginBottom: "12px",
      }}
    >
      {children}
    </p>
  );

  const Li = ({ children }) => (
    <li
      style={{
        fontSize: "14px",
        color: cor.texto,
        lineHeight: "1.75",
        marginBottom: "6px",
      }}
    >
      {children}
    </li>
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: cor.bg,
        fontFamily: "sans-serif",
        paddingBottom: "100px",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: escuro ? "#0A1520" : "#E8F4FF",
          borderBottom: `1px solid ${cor.borda}`,
          padding: "20px 16px",
        }}
      >
        <div style={{ maxWidth: "720px", margin: "0 auto" }}>
          <Link
            to="/"
            style={{
              fontSize: "13px",
              color: cor.link,
              textDecoration: "none",
              display: "inline-block",
              marginBottom: "12px",
            }}
          >
            &#8592; Voltar ao In&#237;cio
          </Link>
          <h1
            style={{
              fontSize: "22px",
              fontWeight: 800,
              color: cor.titulo,
              marginBottom: "6px",
            }}
          >
            Pol&#237;tica de Privacidade
          </h1>
          <p
            style={{ fontSize: "13px", color: cor.texto, marginBottom: "12px" }}
          >
            EduPlay &#8212; Instituto do Saber &#183; &#218;ltima
            atualiza&#231;&#227;o: maio de {Y}
          </p>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <span
              style={{
                padding: "4px 12px",
                background: escuro ? "#0A2A1F" : "#F0FFF8",
                border: "1px solid #00D4AA",
                borderRadius: "999px",
                fontSize: "10px",
                fontWeight: 700,
                color: "#00D4AA",
              }}
            >
              LGPD &#183; Lei 13.709/2018
            </span>
            <span
              style={{
                padding: "4px 12px",
                background: escuro ? "#0A1A2F" : "#F0F4FF",
                border: "1px solid #4A90E2",
                borderRadius: "999px",
                fontSize: "10px",
                fontWeight: 700,
                color: "#4A90E2",
              }}
            >
              ECA &#183; Lei 8.069/1990
            </span>
            <span
              style={{
                padding: "4px 12px",
                background: escuro ? "#1A0A2F" : "#F8F0FF",
                border: "1px solid #9B59B6",
                borderRadius: "999px",
                fontSize: "10px",
                fontWeight: 700,
                color: "#9B59B6",
              }}
            >
              Marco Civil &#183; Lei 12.965/2014
            </span>
          </div>
        </div>
      </div>

      {/* Conteudo */}
      <div
        style={{ maxWidth: "720px", margin: "0 auto", padding: "32px 16px" }}
      >
        {/* Aviso */}
        <div
          style={{
            background: cor.alerta,
            border: `1px solid ${cor.alertaBorda}`,
            borderRadius: "12px",
            padding: "16px",
            marginBottom: "32px",
          }}
        >
          <p
            style={{
              fontSize: "13px",
              color: escuro ? "#F59E0B" : "#92400E",
              fontWeight: 700,
              marginBottom: "4px",
            }}
          >
            &#9888;&#65039; Esta pol&#237;tica &#233; dirigida aos pais e
            respons&#225;veis legais.
          </p>
          <p style={{ fontSize: "13px", color: cor.texto, margin: 0 }}>
            O EduPlay &#233; um produto educacional voltado a menores de idade.
            A contrata&#231;&#227;o, gest&#227;o da assinatura e
            responsabilidade pelo uso cabem exclusivamente ao respons&#225;vel
            legal.
          </p>
        </div>

        {/* ── SEÇÃO 1 — ATUALIZADA ── */}
        <Section titulo="1. Quem somos">
          <P>
            O EduPlay &#233; uma plataforma educacional gamificada desenvolvida
            pelo Instituto do Saber, com equipe formada por pedagoga
            especializada em TEA e letramento, professor licenciado e
            professores especialistas nas disciplinas de{" "}
            <strong style={{ color: cor.titulo }}>
              Hist&#243;ria, Geografia, Matem&#225;tica, Ci&#234;ncias e
              L&#237;ngua Portuguesa
            </strong>
            , e desenvolvedor de tecnologia web. Nosso objetivo &#233; oferecer
            um ambiente seguro e estimulante para estudantes do Ensino
            Fundamental II.
          </P>
          <P>
            Contato:{" "}
            <a
              href="mailto:contato@olloapp.com.br"
              style={{ color: cor.destaque }}
            >
              contato@olloapp.com.br
            </a>
          </P>
        </Section>

        {/* Seção 2 — inalterada */}
        <Section
          titulo="2. Seus dados (Respons&#225;vel Legal)"
          badge="LGPD Art. 7&#186;"
        >
          <P>
            Para a cria&#231;&#227;o de conta e gest&#227;o da assinatura,
            coletamos os seguintes dados do respons&#225;vel legal:
          </P>
          <ul style={{ paddingLeft: "20px", marginBottom: "12px" }}>
            <Li>
              <strong style={{ color: cor.titulo }}>Nome completo</strong>{" "}
              &#8212; identifica&#231;&#227;o do titular da conta.
            </Li>
            <Li>
              <strong style={{ color: cor.titulo }}>CPF</strong> &#8212; exigido
              para emiss&#227;o de cobran&#231;a.
            </Li>
            <Li>
              <strong style={{ color: cor.titulo }}>E-mail</strong> &#8212;
              comunica&#231;&#245;es sobre a conta e assinatura.
            </Li>
            <Li>
              <strong style={{ color: cor.titulo }}>Dados de pagamento</strong>{" "}
              &#8212; processados exclusivamente pelo{" "}
              <strong style={{ color: cor.titulo }}>Mercado Pago</strong>. O
              EduPlay n&#227;o armazena n&#250;meros de cart&#227;o ou dados
              banc&#225;rios.
            </Li>
          </ul>
          <P>
            Base legal:{" "}
            <strong style={{ color: cor.titulo }}>
              LGPD, Art. 7&#186;, inciso V
            </strong>{" "}
            &#8212; execu&#231;&#227;o de contrato de assinatura com o
            respons&#225;vel legal.
          </P>
        </Section>

        {/* ── SEÇÃO 3 — ATUALIZADA ── */}
        <Section
          titulo="3. Dados do Estudante (Menor de Idade)"
          badge="LGPD Art. 14"
        >
          <P>
            O tratamento de dados do aluno segue o{" "}
            <strong style={{ color: cor.titulo }}>Art. 14 da LGPD</strong>, que
            exige que qualquer dado de crian&#231;a ou adolescente seja tratado
            em seu{" "}
            <strong style={{ color: cor.titulo }}>melhor interesse</strong>, com
            consentimento espec&#237;fico do respons&#225;vel legal.
          </P>
          <P>
            Coletamos o{" "}
            <strong style={{ color: cor.titulo }}>
              m&#237;nimo necess&#225;rio
            </strong>
            :
          </P>
          <ul style={{ paddingLeft: "20px", marginBottom: "12px" }}>
            <Li>
              <strong style={{ color: cor.titulo }}>Nome ou apelido</strong>{" "}
              &#8212; identifica&#231;&#227;o dentro da plataforma.
            </Li>
            <Li>
              <strong style={{ color: cor.titulo }}>
                Progresso nas atividades
              </strong>{" "}
              &#8212; armazenado com seguran&#231;a na nuvem (
              <strong style={{ color: cor.titulo }}>Firebase Firestore</strong>
              ), vinculado &#224; conta do respons&#225;vel legal.
            </Li>
            <Li>
              <strong style={{ color: cor.titulo }}>
                Dados de uso an&#244;nimos
              </strong>{" "}
              &#8212; m&#243;dulos acessados, sem identifica&#231;&#227;o
              pessoal.
            </Li>
          </ul>
          <P>
            <strong style={{ color: cor.titulo }}>N&#227;o coletamos</strong> do
            aluno: e-mail, localiza&#231;&#227;o, imagens, voz, dados
            biom&#233;tricos ou qualquer informa&#231;&#227;o sens&#237;vel.
          </P>
        </Section>

        {/* Seção 4 — inalterada */}
        <Section titulo="4. Assinatura e Freemium">
          <P>
            O EduPlay oferece{" "}
            <strong style={{ color: cor.titulo }}>5 dias gratuitos</strong>{" "}
            (freemium) para que o respons&#225;vel avalie a plataforma antes de
            contratar.
          </P>
          <P>
            Ap&#243;s o per&#237;odo gratuito, o acesso completo requer{" "}
            <strong style={{ color: cor.titulo }}>assinatura mensal</strong>,
            contratada e gerenciada exclusivamente pelo respons&#225;vel legal.
            &#201; responsabilidade do respons&#225;vel realizar o cancelamento
            antes da renova&#231;&#227;o, caso n&#227;o deseje continuar. O
            EduPlay n&#227;o se responsabiliza por cobran&#231;as decorrentes de
            n&#227;o cancelamento.
          </P>
          <P>
            Pagamentos s&#227;o processados pelo{" "}
            <strong style={{ color: cor.titulo }}>Mercado Pago</strong>, sujeito
            aos termos e pol&#237;tica de privacidade pr&#243;prios.
          </P>
        </Section>

        {/* Seção 5 — inalterada */}
        <Section
          titulo="5. Prote&#231;&#227;o de Crian&#231;as"
          badge="ECA + Lei 14.811/2024"
        >
          <P>
            O EduPlay opera em conformidade com o{" "}
            <strong style={{ color: cor.titulo }}>ECA (Lei 8.069/1990)</strong>{" "}
            e com a{" "}
            <strong style={{ color: cor.titulo }}>Lei 14.811/2024</strong>, que
            criminalizou o cyberbullying e tornou hediondos crimes digitais
            contra menores.
          </P>
          <ul style={{ paddingLeft: "20px", marginBottom: "12px" }}>
            <Li>
              Conte&#250;do exclusivamente educacional, sem publicidade
              direcionada a crian&#231;as.
            </Li>
            <Li>
              Sem comunica&#231;&#227;o direta entre usu&#225;rios na
              plataforma.
            </Li>
            <Li>
              Controle parental com senha gerenciada pelo respons&#225;vel.
            </Li>
            <Li>
              Nenhum dado do aluno &#233; compartilhado com terceiros para fins
              comerciais.
            </Li>
          </ul>
        </Section>

        {/* Seção 6 — inalterada */}
        <Section titulo="6. Registros de Acesso" badge="Marco Civil Art. 15">
          <P>
            Em conformidade com o{" "}
            <strong style={{ color: cor.titulo }}>
              Marco Civil da Internet (Lei 12.965/2014)
            </strong>
            , o EduPlay pode manter registros de acesso pelo prazo legal de 6
            meses, exclusivamente para cumprimento de obriga&#231;&#245;es
            legais ou ordens judiciais.
          </P>
        </Section>

        {/* ── SEÇÃO 7 — ATUALIZADA ── */}
        <Section titulo="7. Armazenamento e Seguran&#231;a">
          <P>
            O progresso do aluno &#233; armazenado com seguran&#231;a na{" "}
            <strong style={{ color: cor.titulo }}>
              nuvem (Firebase Firestore)
            </strong>
            , vinculado &#224; conta do respons&#225;vel legal — garantindo que
            o hist&#243;rico escolar seja preservado independentemente do
            dispositivo utilizado. Dados do respons&#225;vel s&#227;o
            armazenados em servidores protegidos. N&#227;o utilizamos
            rastreadores, cookies de publicidade ou ferramentas de perfilamento
            comportamental.
          </P>
        </Section>

        {/* Seção 8 — inalterada */}
        <Section titulo="8. Direitos do Respons&#225;vel Legal">
          <P>Nos termos da LGPD, o respons&#225;vel tem direito a:</P>
          <ul style={{ paddingLeft: "20px", marginBottom: "12px" }}>
            <Li>Acessar, corrigir ou excluir os dados cadastrados;</Li>
            <Li>
              Revogar o consentimento para tratamento de dados do aluno a
              qualquer momento;
            </Li>
            <Li>Cancelar a assinatura sem necessidade de justificativa;</Li>
            <Li>
              Solicitar a exclus&#227;o completa da conta e dados associados.
            </Li>
          </ul>
          <P>
            Solicita&#231;&#245;es:{" "}
            <a
              href="mailto:contato@olloapp.com.br"
              style={{ color: cor.destaque }}
            >
              contato@olloapp.com.br
            </a>{" "}
            &#8212; respondemos em at&#233;{" "}
            <strong style={{ color: cor.titulo }}>15 dias &#250;teis</strong>.
          </P>
        </Section>

        {/* Seção 9 — inalterada */}
        <Section titulo="9. Altera&#231;&#245;es nesta Pol&#237;tica">
          <P>
            Esta pol&#237;tica pode ser atualizada. O respons&#225;vel ser&#225;
            notificado por e-mail em caso de altera&#231;&#245;es relevantes. A
            data de atualiza&#231;&#227;o ser&#225; sempre indicada no topo
            desta p&#225;gina.
          </P>
        </Section>

        <div
          style={{
            background: cor.card,
            border: `1px solid ${cor.borda}`,
            borderRadius: "12px",
            padding: "20px",
            marginTop: "8px",
          }}
        >
          <p
            style={{
              fontSize: "13px",
              color: cor.texto,
              lineHeight: "1.6",
              margin: 0,
            }}
          >
            D&#250;vidas?{" "}
            <a
              href="mailto:contato@olloapp.com.br"
              style={{ color: cor.destaque, fontWeight: 700 }}
            >
              contato@olloapp.com.br
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
