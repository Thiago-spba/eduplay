import { Link } from "react-router-dom";
import { useTema } from "../context/ThemeContext";

export default function TermosPage() {
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
            Termos de Uso
          </h1>
          <p style={{ fontSize: "13px", color: cor.texto }}>
            EduPlay &#8212; Instituto do Saber &#183; &#218;ltima
            atualiza&#231;&#227;o: abril de {Y}
          </p>
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
            &#9888;&#65039; Documento dirigido ao respons&#225;vel legal.
          </p>
          <p style={{ fontSize: "13px", color: cor.texto, margin: 0 }}>
            A contrata&#231;&#227;o, gest&#227;o e cancelamento da assinatura
            s&#227;o de responsabilidade exclusiva do respons&#225;vel legal.
            Menores de idade n&#227;o podem contratar por conta pr&#243;pria.
          </p>
        </div>

        <Section titulo="1. Sobre a plataforma e modelo de acesso">
          <P>
            O EduPlay &#233; uma plataforma educacional gamificada do Instituto
            do Saber, destinada a estudantes do Ensino Fundamental II. Ao
            utilizar, o respons&#225;vel legal declara ter lido e concordado com
            estes Termos.
          </P>
          <P>
            O EduPlay opera sob o modelo{" "}
            <strong style={{ color: cor.titulo }}>freemium</strong>: o acesso
            inicial &#233; gratuito por um per&#237;odo de teste de{" "}
            <strong style={{ color: cor.titulo }}>5 dias</strong>. A
            continuidade do acesso ou o desbloqueio de miss&#245;es
            avan&#231;adas pode exigir uma{" "}
            <strong style={{ color: cor.titulo }}>
              assinatura mensal paga
            </strong>
            , contratada e gerenciada exclusivamente pelo respons&#225;vel
            legal. Consulte nossa{" "}
            <Link
              to="/privacidade"
              style={{
                color: cor.destaque,
                textDecoration: "none",
                fontWeight: 700,
              }}
            >
              Pol&#237;tica de Privacidade
            </Link>{" "}
            para detalhes sobre cobran&#231;a e cancelamento.
          </P>
        </Section>

        <Section titulo="2. Responsabilidade do respons&#225;vel legal">
          <P>Por ser destinada a menores de idade, exigimos que:</P>
          <ul style={{ paddingLeft: "20px", marginBottom: "12px" }}>
            <Li>
              O cadastro seja realizado pelo{" "}
              <strong style={{ color: cor.titulo }}>
                respons&#225;vel legal
              </strong>
              .
            </Li>
            <Li>
              O respons&#225;vel configure a{" "}
              <strong style={{ color: cor.titulo }}>
                senha de controle parental
              </strong>
              .
            </Li>
            <Li>
              O respons&#225;vel gerencie e cancele a assinatura quando
              necess&#225;rio.
            </Li>
            <Li>
              O respons&#225;vel acompanhe periodicamente o uso da plataforma
              pelo aluno.
            </Li>
          </ul>
          <P>
            O EduPlay n&#227;o se responsabiliza por cobran&#231;as decorrentes
            de n&#227;o cancelamento dentro do prazo pelo respons&#225;vel.
          </P>
        </Section>

        <Section titulo="3. Assinatura e cancelamento">
          <P>
            A assinatura &#233;{" "}
            <strong style={{ color: cor.titulo }}>
              mensal e renovada automaticamente
            </strong>
            . O cancelamento deve ser realizado pelo respons&#225;vel legal
            antes da data de renova&#231;&#227;o. Pagamentos s&#227;o
            processados pelo{" "}
            <strong style={{ color: cor.titulo }}>Mercado Pago</strong>, sujeito
            aos seus pr&#243;prios termos de servi&#231;o.
          </P>
          <P>
            O per&#237;odo de{" "}
            <strong style={{ color: cor.titulo }}>5 dias gratuitos</strong>{" "}
            n&#227;o exige cadastro de cart&#227;o. A cobran&#231;a s&#243;
            ocorre ap&#243;s contrata&#231;&#227;o expressa pelo
            respons&#225;vel.
          </P>
        </Section>

        <Section titulo="4. Propriedade intelectual" badge="Lei 9.610/1998">
          <P>
            Todo o conte&#250;do pedag&#243;gico, textos, atividades e recursos
            s&#227;o propriedade do Instituto do Saber, protegidos pela{" "}
            <strong style={{ color: cor.titulo }}>
              Lei 9.610/1998 (Direitos Autorais)
            </strong>
            . &#201; vedada a reprodu&#231;&#227;o para fins comerciais sem
            autoriza&#231;&#227;o escrita.
          </P>
        </Section>

        <Section
          titulo="5. Prote&#231;&#227;o de crian&#231;as e seguran&#231;a"
          badge="ECA + Lei 14.811/2024"
        >
          <P>
            O EduPlay opera em conformidade com o{" "}
            <strong style={{ color: cor.titulo }}>ECA (Lei 8.069/1990)</strong>{" "}
            e com a{" "}
            <strong style={{ color: cor.titulo }}>Lei 14.811/2024</strong>, que
            criminalizou o cyberbullying e tornou hediondos crimes digitais
            praticados contra menores.
          </P>
          <ul style={{ paddingLeft: "20px", marginBottom: "12px" }}>
            <Li>
              Conte&#250;do exclusivamente educacional, sem publicidade para
              crian&#231;as.
            </Li>
            <Li>
              Sem comunica&#231;&#227;o direta entre usu&#225;rios na
              plataforma.
            </Li>
            <Li>
              Controle parental com senha gerenciada pelo respons&#225;vel.
            </Li>
            <Li>
              Nenhum dado do aluno compartilhado com terceiros para fins
              comerciais.
            </Li>
          </ul>
          <P>
            Do ponto de vista t&#233;cnico, adotamos{" "}
            <strong style={{ color: cor.titulo }}>hashing SHA-256</strong> para
            proteger a identidade digital dos usu&#225;rios e mantemos{" "}
            <strong style={{ color: cor.titulo }}>
              logs de consentimento im&#250;t&#225;veis
            </strong>{" "}
            conforme exigido pela legisla&#231;&#227;o vigente.
          </P>
        </Section>

        <Section titulo="6. Conte&#250;do e Intelig&#234;ncia Artificial">
          <P>
            O EduPlay utiliza{" "}
            <strong style={{ color: cor.titulo }}>
              Intelig&#234;ncia Artificial
            </strong>{" "}
            para auxiliar na cria&#231;&#227;o de miss&#245;es pedag&#243;gicas
            baseadas no{" "}
            <strong style={{ color: cor.titulo }}>
              Curr&#237;culo Paulista
            </strong>
            . Todo o conte&#250;do gerado por IA passa por{" "}
            <strong style={{ color: cor.titulo }}>
              revis&#227;o e curadoria t&#233;cnica
            </strong>{" "}
            da equipe do Instituto do Saber, composta por pedagoga especializada
            em TEA e letramento e professor licenciado, garantindo qualidade,
            adequa&#231;&#227;o et&#225;ria e precis&#227;o pedag&#243;gica.
          </P>
        </Section>

        <Section titulo="7. Privacidade e dados" badge="LGPD Art. 14">
          <P>
            O tratamento de dados segue nossa{" "}
            <Link
              to="/privacidade"
              style={{
                color: cor.destaque,
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Pol&#237;tica de Privacidade
            </Link>
            , em conformidade com a{" "}
            <strong style={{ color: cor.titulo }}>
              LGPD (Lei 13.709/2018)
            </strong>
            , aplicando o <strong style={{ color: cor.titulo }}>Art. 14</strong>{" "}
            para dados do aluno e o{" "}
            <strong style={{ color: cor.titulo }}>Art. 7&#186;</strong> para
            dados do respons&#225;vel legal.
          </P>
        </Section>

        <Section titulo="8. Disponibilidade do servi&#231;o">
          <P>
            O EduPlay est&#225; em desenvolvimento cont&#237;nuo. Podemos
            atualizar ou interromper funcionalidades visando a melhoria
            educacional. N&#227;o garantimos disponibilidade ininterrupta
            durante manuten&#231;&#245;es programadas.
          </P>
        </Section>

        <Section titulo="9. Limita&#231;&#227;o de responsabilidade">
          <P>O Instituto do Saber n&#227;o se responsabiliza por:</P>
          <ul style={{ paddingLeft: "20px", marginBottom: "12px" }}>
            <Li>Falhas de conectividade no dispositivo do usu&#225;rio.</Li>
            <Li>
              <strong style={{ color: cor.titulo }}>
                Perda de progresso por limpeza de cache:
              </strong>{" "}
              o EduPlay utiliza armazenamento local (localStorage) para garantir
              rapidez e privacidade do aprendizado. O usu&#225;rio est&#225;
              ciente de que a limpeza de cache ou dados do navegador pode
              resultar na perda do progresso n&#227;o sincronizado com a conta
              do respons&#225;vel.
            </Li>
            <Li>
              Cobran&#231;as por n&#227;o cancelamento da assinatura pelo
              respons&#225;vel legal.
            </Li>
            <Li>
              Uso inadequado por terceiros n&#227;o autorizados pelo
              respons&#225;vel.
            </Li>
          </ul>
        </Section>

        <Section titulo="10. Altera&#231;&#245;es nos termos">
          <P>
            Estes termos podem ser atualizados. O respons&#225;vel ser&#225;
            notificado por e-mail em caso de altera&#231;&#245;es relevantes. A
            data ser&#225; sempre indicada no topo desta p&#225;gina.
          </P>
        </Section>

        <Section titulo="11. Contato e foro">
          <P>
            D&#250;vidas:{" "}
            <a
              href="mailto:contato@olloapp.com.br"
              style={{ color: cor.destaque }}
            >
              contato@olloapp.com.br
            </a>
          </P>
          <P>
            Regido pela legisla&#231;&#227;o brasileira. Foro: comarca de
            S&#227;o Paulo/SP.
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
            D&#250;vidas sobre estes termos?{" "}
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
